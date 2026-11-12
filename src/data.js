// Firebase 即時多人（看得到其他訪客）。null＝不開多人。apiKey 這類設定本來就是公開的，可以放在網頁裡。
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBbGzxIF1aS7rTjOhJHKmc3Ua6M14WZwrg",
  authDomain: "shoushan-memorial.firebaseapp.com",
  databaseURL: "https://shoushan-memorial-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shoushan-memorial",
  storageBucket: "shoushan-memorial.firebasestorage.app",
  messagingSenderId: "1098575781336",
  appId: "1:1098575781336:web:c83a315cb22d2520a666ad"
};

// Google 試算表的 Apps Script 部署網址（https://script.google.com/macros/s/…/exec）。
// 空白＝燈籠和留言只存在訪客自己的裝置。
const SHEET_API = 'https://script.google.com/macros/s/AKfycbzBJlQISNmieFv-U-Hk3BQ9K-XNA-oqzQIoFx_hGl0ArDKVFOjtJE_Q-by4kVGeebWSiw/exec';

const ANIMALS = [
  { id:'mimi', credit:'照片：高雄市觀光局提供（翻攝自新聞，暫用）', name:'咪咪', species:'紅毛猩猩（母）', color:'#c46a3a', died:'2024.07.31', age:'38 歲',
    story:'原本是私人飼養的紅毛猩猩，2008 年透過收容計畫來到壽山。剛來時缺乏攀爬環境、營養也不均衡，幾乎只能在地上走；園方調整飲食、搭起高挑的棲架後，她慢慢練出體力，重新學會攀爬。後來因為會「擦玻璃」被網友封為「工讀生」，成了園裡的明星。',
    timeline:[['2008','經收容計畫來到壽山'],['2021','成為園方動物繪本的主角'],['2023','參與魏德聖執導電影《BIG》'],['2024.07.31','安詳離世，享年 38 歲']],
    facts:['生理期時會裹著最愛的帆布或大毛巾，在涵洞裡安靜待上一兩天，是她和保育員的小祕密','寒流時穿上保暖衣物，被稱作「時尚猩猩」','鄰居阿宏常想吸引她注意，「咪咪女王」卻總是不為所動','園方與插畫家玉子合作的繪本《壽山好夥伴：走進動物的生命故事》以她為主角'],
    social:'',
    closeups:[
      {img:'images/mimi_c2.jpg', ig:'', caption:'拖著布準備鑽進涵洞的咪咪（影片截圖，雲霜姐提供）'},
      {img:'images/mimi_c3.jpg', ig:'', caption:'從涵洞裡探出頭來（影片截圖，雲霜姐提供）'},
      {img:'images/mimi_c1.jpg', ig:'', caption:'趴在涵洞邊吃點心的咪咪（影片截圖，雲霜姐提供）'} ],
    src:[['Newtalk','https://newtalk.tw/news/view/2024-08-01/930508'],['公視新聞','https://news.pts.org.tw/article/707768'],['工商時報','https://www.ctee.com.tw/news/20240801700743-431401']] },
  { id:'dajie', credit:'照片：保育員李宥逸提供', name:'大姊', species:'非洲獅（母）', color:'#d9a441', died:'2025.09 下旬', age:'20 多歲',
    story:'個性親人，每天早上都急著衝進展場，傍晚散步時常走到大貓廊道，和大小朋友近距離見面。平常脾氣火爆的二哥，遇到她總是特別溫柔。每天快閉園時的獅吼，是她和小乖、二哥、小辛約好的「下班暗號」。',
    timeline:[['2025.08 中','保育員發現她食慾變差，獸醫麻醉檢查發現右側乳腺有腫塊'],['2025.09 中','病況急轉直下，出現血樣腹水'],['2025.09 下旬','因癌症離世，高齡 20 多歲，約相當人類 80 歲']],
    facts:['園方曾拍到她細心整理好毛髮，再慢慢走到二哥面前的溫馨畫面','獅子生性兇猛、不容易靠近，保育員要花更多心力觀察食量、行為和排遺，才能及早發現身體不舒服','保育員李宥逸陪她抗病的那段日子，每天都睡不好','今年從六福村來的母獅「布蕾」已經融入壽山大家庭，偶爾的呆萌模樣陪大家度過不捨'],
    social:'',
    closeups:[
      {img:'images/dajie_c1.jpg', ig:'', caption:'在展場散步的大姊（攝影：志工許世忠）'},
      {img:'images/dajie_c2.jpg', ig:'', caption:'大姊和二哥一起在木台下午睡（保育員李宥逸提供）'},
      {img:'images/dajie_c3.jpg', ig:'', caption:'保育員李宥逸與大姊、二哥（園方新聞稿照片）'} ],
    src:[['壽山動物園新聞稿','https://www.facebook.com/ShouShanZoo'],['自由時報','https://news.ltn.com.tw/news/life/breakingnews/5225961'],['Newtalk','https://newtalk.tw/news/view/2023-08-10/883643'],['民視','https://english.ftvnews.com.tw/news/2026409W01EA']] },
  { id:'ali', credit:'照片：取自壽山動物園臉書（翻攝自新聞，暫用）', name:'阿里', species:'非洲象（母）', color:'#8e8a86', died:'2026.02.14', age:'52 歲',
    story:'1978 年和同伴安妮一起從美國漂洋過海來到高雄，見證了動物園的搬遷與改建，陪伴好幾代人長大，不少家庭三代都和她合照過。她聰明又帶點調皮，會趁保育員專心打掃時突然「突襲」，沖澡時偷偷多喝幾口水，也最愛踩水池戲水。',
    timeline:[['1978','和安妮一起從美國來台'],['2003','同伴安妮過世'],['2026','參與 Disney+ 影集《動物園》拍攝'],['2026.02.14','凌晨安詳離世，享年 52 歲']],
    facts:['對陌生人很有防備，要花時間才建立得起信任','聽到熟悉的呼喚會緩緩走近，輕輕擺動長鼻回應','保育員：體型龐大，卻心思細膩'],
    social:'',
    closeups:[
      {img:'images/ali_c1.jpg', ig:'', caption:'1978 年，阿里、安妮和當時的保育員邱石柱（邱大哥提供）'},
      {img:'images/ali_c2.jpg', ig:'', caption:'吃冰消暑的阿里'},
      {img:'images/ali_c3.jpg', ig:'', caption:'張開大耳朵的阿里'} ],
    src:[['公視新聞','https://news.pts.org.tw/article/795448'],['中央社','https://www.cna.com.tw/news/aloc/202602150054.aspx'],['PChome 新聞','https://news.pchome.com.tw/travel/newstaiwandigi/20260215/index-77113569945449279015.html']] },
  { id:'zhaohai', credit:'照片：壽山動物園提供（翻攝自新聞，暫用）', name:'昭海', species:'白老虎（孟加拉虎）', color:'#e9e4da', died:'2026.02.22', age:'19 歲',
    story:'2006 年 11 月 24 日出生於廣州香江動物園，2011 年搭飛機來到高雄，陪伴大家超過 14 年。2019 年起與高齡貓科常見的慢性腎臟病共處，保育員和獸醫用多樣化的飲食、引導喝水，讓他在晚年仍維持良好的生活品質。',
    timeline:[['2006.11.24','出生'],['2011','來到壽山'],['2019','開始照護慢性腎臟病'],['2026.02.22','安詳離世，享年 19 歲']],
    facts:['白老虎其實就是孟加拉虎，白毛來自隱性基因，身上仍有黑色條紋','相當人類 90 歲高齡','照顧他的經驗，成為孟加拉虎高齡醫療的寶貴紀錄'],
    social:'',
    closeups:[
      {img:'images/zhaohai_c1.jpg', ig:'', caption:'保育員視角的昭海'},
      {img:'images/zhaohai_c2.jpg', ig:'', caption:'在棲架上休息的昭海'},
      {img:'images/zhaohai_c3.jpg', ig:'', caption:'昭海的大肉墊'} ],
    src:[['公視新聞','https://news.pts.org.tw/article/796157'],['中央社','https://www.cna.com.tw/news/aloc/202602240024.aspx']] },
  { id:'erge', credit:'照片：高市府觀光局提供（翻攝自新聞，暫用）', name:'二哥', species:'非洲獅（公）', color:'#b8853f', died:'2026.04.13', age:'23 歲',
    story:'2010 年從六福村來到壽山，陪伴大家 16 年。個性內斂，總愛在一旁看著大姊散步。晚年和青光眼、牙齒、脊椎退化等老化問題共處，接受過右眼摘除和犬齒拔除手術。野外的獅子通常只活到 10 到 15 歲，他走到了 23 歲，是名副其實的「獅瑞」。',
    timeline:[['2010','從六福村來到壽山'],['2022','右眼摘除手術'],['2026 初','上犬齒拔除手術'],['2026.04.13','安詳離世，享年 23 歲']],
    facts:['園方曾在 IG 分享照顧老獅子的心情，說要陪他一起變老','保育員李宥逸：「這段共同走過的時光，我會永遠珍藏在心裡」'],
    social:'',
    closeups:[
      {img:'images/erge_c1.jpg', ig:'', caption:'二哥的獅吼，是閉園前的下班暗號（園方新聞稿照片）'},
      {img:'images/erge_c2.jpg', ig:'', caption:'保育員李宥逸在櫥窗前用響片和二哥互動'},
      {img:'images/erge_c3.jpg', ig:'', caption:'二哥（攝影：志工許世忠）'} ],
    src:[['公視新聞','https://news.pts.org.tw/article/803552'],['工商時報','https://www.ctee.com.tw/news/20260414700835-431401']] },
  { id:'mary', credit:'照片：壽山動物園提供（翻攝自新聞，暫用）', name:'瑪莉', species:'台灣黑熊（母）', color:'#3b3532', died:'2026.04.27', age:'約 30 歲',
    story:'2020 年從民間來到壽山。以前的飼主沒有建檔，確切年紀無從得知，獸醫從牙齒和體態推估她三十多歲，是園裡最資深的「黑熊奶奶」。她總是慢慢地、優雅地過日子：在落葉堆上散步、悠哉地抬腿伸展，最喜歡懶洋洋躺在鋪滿樹葉的地上。',
    timeline:[['2020','從民間來到壽山安置'],['2026.04.27','在睡夢中安詳離世']],
    facts:['園方為年邁的她改建了地面水池','大家會想念她泡澡的身影','園方：謝謝她教我們生命老去的優雅與淡定'],
    social:'',
    closeups:[
      {img:'images/mary_c1.jpg', ig:'', caption:'胸前白色的 V 字，是台灣黑熊的招牌'},
      {img:'images/mary_c2.jpg', ig:'', caption:'瑪莉奶奶的水果大餐'},
      {img:'images/mary_c3.jpg', ig:'', caption:'躺在草叢裡休息的瑪莉'} ],
    src:[['工商時報','https://www.ctee.com.tw/news/20260428701153-431401'],['遠見','https://www.gvm.com.tw/article/87704']] },
];

