import os
import shutil
import time
import requests
from io import BytesIO
from PIL import Image
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request
import pandas as pd
from collections import Counter
from flask_cors import CORS

# Flask 기본 세팅
app = Flask(__name__)
CORS(app) # CORS 설정

# 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROME_DRIVER_PATH = os.path.join(BASE_DIR, "chromedriver.exe")
TFLITE_MODEL_PATH = os.path.join(BASE_DIR, "NO1model.tflite")
STATIC_DIR = os.path.join(BASE_DIR, "static")
YOUTUBE_SAVE_DIR = os.path.join(STATIC_DIR, "youtube_thumbnails")
MUSINSA_SAVE_DIR = os.path.join(STATIC_DIR, "musinsa_images")
STYLE_COUNTS_PATH = os.path.join(STATIC_DIR, "style_counts.csv")

os.makedirs(YOUTUBE_SAVE_DIR, exist_ok=True)
os.makedirs(MUSINSA_SAVE_DIR, exist_ok=True)

# 스타일 클래스 목록
class_names = [
    "Others", "Retro", "Romantic", "Resort", "Manish", "Modern", "Military", "Sexy", "Sophisticated",
    "Street", "Sporty", "Avant-garde", "Oriental", "Western", "Genderless", "Country",
    "Classic", "Kitsch", "Tomboy", "Punk", "Feminine", "Preppy", "Hippie", "Hip-hop"
]

def predict_style_on_image(img):
    interpreter = tf.lite.Interpreter(model_path=TFLITE_MODEL_PATH)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    input_dtype = input_details[0]['dtype']
    img_resized = img.resize((224, 224))
    img_np = np.array(img_resized)
    if input_dtype == np.float32:
        img_np = img_np.astype(np.float32) / 255.0
    elif input_dtype == np.uint8:
        img_np = img_np.astype(np.uint8)
    else:
        raise ValueError("지원하지 않는 입력 데이터 타입")
    input_tensor = np.expand_dims(img_np, axis=0)
    interpreter.set_tensor(input_details[0]['index'], input_tensor)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    predicted_class = np.argmax(output_data)
    return class_names[predicted_class]

def search_youtube_and_predict_style(query, api_key, max_results=4):
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

    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_item = {executor.submit(process_video, item): item for item in enumerate(items)}
        for future in concurrent.futures.as_completed(future_to_item):
            video_data, predicted_style, style_for_count = future.result()
            if video_data:
                youtube_data.append(video_data)
                styles_found.add(predicted_style)
                if style_for_count:
                    style_counts[style_for_count] += 1
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
    url = 'https://www.musinsa.com/main/outlet/ranking?storeCode=outlet&sectionId=233&contentsId=&categoryCode=107001&gf=F'
    driver.get(url)
    time.sleep(3)
    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height
    soup = BeautifulSoup(driver.page_source, 'html.parser')
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
    df = df.sort_values(by='count', ascending=False).head(3)
    df['rank'] = range(1, len(df) + 1)
    style_image_map = {
        'punk': 'bestpunk1.jpg',
        'Oriental': 'orientalbest1.jpg',
        'Street': 'streetbest1.jpg'
    }
    df['image'] = df['style'].map(style_image_map)
    ranks = df.to_dict('records')
    return jsonify(ranks)

@app.route("/api/process", methods=['POST'])
def process():
    data = request.get_json()
    query = f"{data.get('occasion', '데일리')}룩"
    
    if not query.strip():
        return jsonify({"error": "검색어가 없습니다."}), 400

    if os.path.exists(YOUTUBE_SAVE_DIR):
        shutil.rmtree(YOUTUBE_SAVE_DIR)
    if os.path.exists(MUSINSA_SAVE_DIR):
        shutil.rmtree(MUSINSA_SAVE_DIR)
    os.makedirs(YOUTUBE_SAVE_DIR, exist_ok=True)
    os.makedirs(MUSINSA_SAVE_DIR, exist_ok=True)

    YOUTUBE_API_KEY = "AIzaSyBeW1ruF8GdOZC3f6pU2B_8glHuMzgstQk" # 키는 별도 관리 필요
    youtube_results, youtube_styles = search_youtube_and_predict_style(query, YOUTUBE_API_KEY)
    musinsa_data = crawl_musinsa_images(max_items=100)
    matched_musinsa = filter_musinsa_by_styles(musinsa_data, youtube_styles)
    
    return jsonify({
        "youtube_results": youtube_results,
        "musinsa_results": matched_musinsa
    })

# 서버 실행
if __name__ == "__main__":
    app.run(debug=True, port=5000)