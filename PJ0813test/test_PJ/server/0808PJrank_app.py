import os
import shutil
import time
import requests
import random
from io import BytesIO
from PIL import Image
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request
import pandas as pd
from collections import Counter
from flask_cors import CORS

# 이거 pip install 모음임 다운 안된거 있으면 그냥 컨cv 하기
# pip install flask flask-cors requests beautifulsoup4 selenium pillow pandas numpy tensorflow google-api-python-client

# Flask 기본 세팅
app = Flask(__name__)
CORS(app) # CORS 설정

# 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROME_DRIVER_PATH = os.path.join(BASE_DIR, "chromedriver.exe")
TFLITE_MODEL_PATH = os.path.join(BASE_DIR, "fashion8_2025-08-14_model.tflite")
TFLITE_AEGEN_TETO_MODEL_PATH = os.path.join(BASE_DIR, "20250814egenteto.tflite")
STATIC_DIR = os.path.join(BASE_DIR, "static")
YOUTUBE_SAVE_DIR = os.path.join(STATIC_DIR, "youtube_thumbnails")
MUSINSA_SAVE_DIR = os.path.join(STATIC_DIR, "musinsa_images")
STYLE_COUNTS_PATH = os.path.join(STATIC_DIR, "style_counts.csv")

os.makedirs(YOUTUBE_SAVE_DIR, exist_ok=True)
os.makedirs(MUSINSA_SAVE_DIR, exist_ok=True)

# 스타일 클래스 목록
class_names = [
    "feminin","natural","chic","casual","sporty","street","classic","retro"
]
# 이미지 -> 스타일 예측 함수임
def predict_style_on_image(img):
    interpreter = tf.lite.Interpreter(model_path=TFLITE_MODEL_PATH)
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    input_dtype = input_details[0]['dtype']
    
    #이미지 전처리
    img_resized = img.resize((224, 224))
    img_np = np.array(img_resized)
    
    #입력 데이터 타입에 변환(이미지)
    if input_dtype == np.float32:
        img_np = img_np.astype(np.float32) / 255.0
    elif input_dtype == np.uint8:
        img_np = img_np.astype(np.uint8)
    else:
        raise ValueError("지원하지 않는 입력 데이터 타입")
    
    #배치 차원 추가 후 모델 입력
    input_tensor = np.expand_dims(img_np, axis=0)
    interpreter.set_tensor(input_details[0]['index'], input_tensor)
    interpreter.invoke()

    # 출력갑에서 가장 확률 높은 클라스 선택
    output_data = interpreter.get_tensor(output_details[0]['index'])
    predicted_class = np.argmax(output_data)
    return class_names[predicted_class]

# 유튜브에서 영상 검색 -> 썸네일 예측/ max_results = (검색할 영상 숫자)
def search_youtube_and_predict_style(query, api_key, max_results=8):
    from googleapiclient.discovery import build
    import concurrent.futures

    youtube = build("youtube", "v3", developerKey=api_key)
    search_request = youtube.search().list(
        q=query,
        part="snippet",
        maxResults=max_results,
        type="video",
        videoDuration="short"
    )
    response = search_request.execute()
    items = response.get("items", [])

    youtube_data = []
    styles_found = set()
    style_counts = Counter()

    # 영상 1개 처리 로직
    def process_video(item_with_idx):
        idx, item = item_with_idx
        video_id = item["id"]["videoId"]
        title = item["snippet"]["title"]
        thumb_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"

        try:
            response_img = requests.get(thumb_url, timeout=10)
            img = Image.open(BytesIO(response_img.content)).convert("RGB")
        except Exception as e:
            print(f"[썸네일 다운로드 실패] {e}")
            return None, None, None
        
        predicted_style = predict_style_on_image(img)
        
        # 썸네일 저장
        filename = f"{idx+1}_{video_id}.jpg"
        save_path = os.path.join(YOUTUBE_SAVE_DIR, filename)
        img.save(save_path)

        video_data = {
            'video_id': video_id,
            'title': title,
            'thumbnail_path': f"/static/youtube_thumbnails/{filename}",
            'style': predicted_style
        }
        return video_data, predicted_style, predicted_style

    # 멀티스레드로 병렬 처리
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_item = {executor.submit(process_video, item): item for item in enumerate(items)}
        for future in concurrent.futures.as_completed(future_to_item):
            video_data, predicted_style, style_for_count = future.result()
            if video_data:
                youtube_data.append(video_data)
                styles_found.add(predicted_style)
                if style_for_count:
                    style_counts[style_for_count] += 1

    # 랭킹 스타일 카운트 csv 업뎃               
    update_style_counts(style_counts)
    return youtube_data, styles_found

def update_style_counts(new_counts):
    if os.path.exists(STYLE_COUNTS_PATH):
        df = pd.read_csv(STYLE_COUNTS_PATH)
        new_counts_df = pd.DataFrame(list(new_counts.items()), columns=['style', 'count'])
        df = pd.concat([df, new_counts_df]).groupby('style').sum().reset_index()
    else:
        df = pd.DataFrame(list(new_counts.items()), columns=['style', 'count'])
    df.to_csv(STYLE_COUNTS_PATH, index=False)

# 무신사 크롤링 max_items=갯수 밑에꺼도 동일하게 변경하기
def crawl_musinsa_images(max_items=300):
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
    )

    service = Service(CHROME_DRIVER_PATH)
    driver = webdriver.Chrome(service=service, options=chrome_options)

    # 무신사 웹페이지 주소 변경및 html 구조 변경으로 수정
    url = 'https://www.musinsa.com/main/outlet/ranking?gf=F&storeCode=outlet&sectionId=233&contentsId=&categoryCode=107001&ageBand=AGE_BAND_ALL'
    driver.get(url)
    time.sleep(5)

    item_htmls = set()
    stale_scroll_count = 0
    
    # 스크롤 반복 -> 삼풍 로딩
    while len(item_htmls) < max_items:
        last_count = len(item_htmls)
        
        elements = driver.find_elements(By.CSS_SELECTOR, 'a[data-item-id]')
        for el in elements:
            try:
                item_htmls.add(el.get_attribute('outerHTML'))
            except Exception as e:
                continue

        new_count = len(item_htmls)

        # 스크롤 정지 새 상품 없을때
        if new_count == last_count:
            stale_scroll_count += 1
            if stale_scroll_count >= 10:
                break
        else:
            stale_scroll_count = 0

        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(7)

    combined_html = "<html><body>" + "".join(list(item_htmls)) + "</body></html>"
    soup = BeautifulSoup(combined_html, 'html.parser')
    driver.quit()

    product_anchors = soup.select('a[data-item-id]')
    results = []

    for idx, anchor in enumerate(product_anchors):
        if idx >= max_items:
            break

        link = anchor.get('href')
        full_link = 'https://www.musinsa.com' + link if link and link.startswith('/products') else link
        
        img_tag = anchor.find('img')
        if img_tag and img_tag.has_attr('src'):
            img_url = img_tag['src']
            if img_url.startswith('//'):
                img_url = 'https' + img_url

            try:
                response = requests.get(img_url, timeout=10)
                response.raise_for_status()
                filename = f"musinsa_{idx+1:03d}.jpg"
                save_path = os.path.join(MUSINSA_SAVE_DIR, filename)
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                results.append({
                    'product_link': full_link,
                    'image_path': f"/static/musinsa_images/{filename}",
                    'image_url': img_url
                })
            except Exception as e:
                print(f"[Musinsa {idx+1:03d}] 다운로드 실패: {e}")
    return results

# 무신사 이미지 -> 스타일 필터링
def filter_musinsa_by_styles(musinsa_data, styles_set):
    import concurrent.futures
    filtered = []

    def process_item(item):
        try:
            image_full_path = os.path.join(BASE_DIR, item['image_path'].strip("/"))
            img = Image.open(image_full_path).convert("RGB")
            predicted_style = predict_style_on_image(img)
            if predicted_style in styles_set:
                return {
                    "image": item['image_path'],
                    "product_link": item['product_link'],
                    "style": predicted_style
                }
        except Exception as e:
            print(f"[무신사 스타일 예측 오류] {item['image_path']}: {e}")
        return None

    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_item = {executor.submit(process_item, item): item for item in musinsa_data}
        for future in concurrent.futures.as_completed(future_to_item):
            result = future.result()
            if result:
                filtered.append(result)
    return filtered

@app.route("/api/rank")
def rank():
    if not os.path.exists(STYLE_COUNTS_PATH):
        return jsonify({"error": "아직 집계된 데이터가 없습니다."}), 404
    df = pd.read_csv(STYLE_COUNTS_PATH)
    df = df.sort_values(by='count', ascending=False).head(10)
    df['style'] = df['style'].str.capitalize()
    df['rank'] = range(1, len(df) + 1)

    def get_image_path(style):
        image_map = {
            'casual':'casual.jpg',
            'chic':'chic.jpg',
            'classic':'classic2.jpg',
            'feminine':'feminin2.jpg',
            'natural':'natural1.jpg',
            'retro':'retro2.jpg',
            'sporty':'sporty2.jpg',
            'street':'street2.jpg'
        }
        return f"/static/beststy/{image_map.get(style.lower())}" if style.lower() in image_map else None

    df['image'] = df.apply(lambda row: get_image_path(row['style']) if row['rank'] <= 3 else None, axis=1)

    ranks = df.to_dict('records')
    return jsonify(ranks)

@app.route("/api/process", methods=['POST'])
def process():
    data = request.get_json()
    occasion = data.get('occasion')
    season = data.get('season')

    # '약속'은 '데이트'로 처리하여 검색어 생성
    if occasion == '약속':
        occasion = '데이트'

    query_map = {
        '데일리': {
            '봄': ['봄데일리룩', '봄일상룩', '봄개강룩'],
            '여름': ['여름데일리룩', '여름일상룩', '여름개강룩'],
            '가을': ['가을데일리룩', '가을일상룩', '가을개강룩'],
            '겨울': ['겨울데일리룩', '겨울일상룩', '겨울개강룩']
        },
        '격식': {
            '봄': ['봄하객룩', '봄직장인코디', '봄직장인 룩북', '봄출근룩'],
            '여름': ['여름하객룩', '여름직장인코디', '여름직장인 룩북', '여름출근룩'],
            '가을': ['가을하객룩', '가을직장인코디', '가을직장인 룩북', '가을출근룩'],
            '겨울': ['겨울하객룩', '겨울직장인코디', '겨울직장인 룩북', '겨울출근룩']
        },
        '운동': {
            '봄': ['봄여자 운동복', '봄여자 등산복', '봄여자 런닝복', '애슬레저룩'],
            '여름': ['여름여자 운동복', '여름여자 등산복', '여름여자 런닝복'],
            '가을': ['가을여자 운동복', '가을여자 등산복', '가을여자 런닝복'],
            '겨울': ['겨울여자 운동복', '겨울여자 등산복', '겨울여자 런닝복']
        },
        '휴가': {
            '봄': ['봄여행룩', '봄여행코디'],
            '여름': ['여름여행룩', '여름여행코디', '동남아 여행 코디', '동남아 여행룩'],
            '가을': ['가을여행룩', '가을여행코디'],
            '겨울': ['겨울여행룩', '겨울여행코디', '삿포로 여행 코디', '삿포로 여행룩']
        },
        '데이트': {
            '봄': ['봄 데이트룩', '봄 번따룩', '봄 꾸꾸꾸', '벛꽃 데이트룩', '벛꽃놀이코디'],
            '여름': ['여름데이트룩', '여름번따룩', '여름꾸꾸꾸', '여름페스티벌룩'],
            '가을': ['가을데이트룩', '가을번따룩', '가을꾸꾸꾸', '가을수학여행코디'],
            '겨울': ['겨울데이트룩', '겨울번따룩', '겨울꾸꾸꾸', '연말룩', '연말코디']
        }
    }

    query_list = query_map.get(occasion, {}).get(season)
    
    if not query_list:
        # 기본 검색어 설정
        query = f"{season or ''}{occasion or '데일리'}룩"
    else:
        query = random.choice(query_list)

    print(f"선택된 랜덤 검색어: {query}")

    if not query.strip():
        return jsonify({"error": "검색어가 없습니다."}), 400

    if os.path.exists(YOUTUBE_SAVE_DIR):
        shutil.rmtree(YOUTUBE_SAVE_DIR)
    if os.path.exists(MUSINSA_SAVE_DIR):
        shutil.rmtree(MUSINSA_SAVE_DIR)
    os.makedirs(YOUTUBE_SAVE_DIR, exist_ok=True)
    os.makedirs(MUSINSA_SAVE_DIR, exist_ok=True)

    YOUTUBE_API_KEY = "AIzaSyDhK7bVZDtpHprRWPaJHle2xJFC9fBX7b4" # 키는 별도 관리 필요
    youtube_results, youtube_styles = search_youtube_and_predict_style(query, YOUTUBE_API_KEY)
    musinsa_data = crawl_musinsa_images(max_items=300)
    matched_musinsa = filter_musinsa_by_styles(musinsa_data, youtube_styles)
    
    return jsonify({
        "youtube_results": youtube_results,
        "musinsa_results": matched_musinsa
    })

# 에겐/테토 스타일 예측 함수
def predict_aegen_teto_style(img):
    interpreter = tf.lite.Interpreter(model_path=TFLITE_AEGEN_TETO_MODEL_PATH)
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    input_dtype = input_details[0]['dtype']
    output_dtype = output_details[0]['dtype'] # ADDED THIS LINE
    
    # 이미지 전처리
    img_resized = img.resize((224, 224))
    img_np = np.array(img_resized)
    
    # 입력 데이터 타입에 변환(이미지)
    if input_dtype == np.float32:
        img_np = img_np.astype(np.float32) / 255.0
    elif input_dtype == np.uint8:
        img_np = img_np.astype(np.uint8)
    else:
        raise ValueError("지원하지 않는 입력 데이터 타입")
    
    # 배치 차원 추가 후 모델 입력
    input_tensor = np.expand_dims(img_np, axis=0)
    interpreter.set_tensor(input_details[0]['index'], input_tensor)
    interpreter.invoke()

    # 출력값에서 확률을 직접 사용
    output_data = interpreter.get_tensor(output_details[0]['index'])[0] # CORRECTED INDENTATION

    # 출력도 uint8일 경우 0~255 → 0~1 스케일링
    if output_dtype == np.uint8:
        output_data = output_data.astype(np.float32) / 255.0

    # 에겐과 테토 확률 추출
    aegen_prob = output_data[0] # Assuming "에겐녀" is at index 0
    teto_prob = output_data[1]  # Assuming "테토녀" is at index 1
    
    return aegen_prob, teto_prob # Return both probabilities

@app.route("/api/testo", methods=['POST'])
def testo_style_check():
    if 'file' not in request.files:
        return jsonify({"error": "파일이 없습니다."}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "파일이 선택되지 않았습니다."}), 400

    try:
        img = Image.open(file.stream).convert("RGB")
        aegen_prob, teto_prob = predict_aegen_teto_style(img) # Receive both probabilities
        
        aegen_percentage = int(aegen_prob * 100)
        teto_percentage = int(teto_prob * 100) # Calculate teto percentage directly
        
        return jsonify({
            "aegen": aegen_percentage,
            "teto": teto_percentage
        })

    except Exception as e:
        return jsonify({"error": f"스타일 분석 중 오류 발생: {e}"}), 500

# 서버 실행
if __name__ == "__main__":
    app.run(debug=True, port=5000)
