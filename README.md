# Interactive Map Explorer

Bu uygulama, Leaflet harita kütüphanesi ve Google Gemini AI kullanarak interaktif bir harita deneyimi sunan bir Next.js uygulamasıdır. Kullanıcılar, doğal dil sorguları kullanarak haritada yerler keşfedebilir ve günlük gezi planları oluşturabilirler.

## Özellikler

- **Genel Keşif Modu**: Herhangi bir konum, tarihi yer veya ilgi çekici nokta hakkında bilgi alın ve haritada görüntüleyin
- **Gün Planlayıcı Modu**: Belirli bir bölge için detaylı bir günlük gezi planı oluşturun
- **İnteraktif Harita**: Konumlar arasında gezinin ve detaylı bilgileri görüntüleyin
- **Zaman Çizelgesi**: Gün planınızı kronolojik olarak görüntüleyin
- **Dışa Aktarma**: Oluşturulan gezi planlarını metin dosyası olarak kaydedin

## Başlangıç

### Gereksinimler

- Node.js 18.0.0 veya üzeri
- Google Gemini API anahtarı

### Kurulum

1. Projeyi klonlayın:
   ```
   git clone https://github.com/kullanici/maps-planner.git
   cd maps-planner
   ```

2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

3. `.env.local` dosyasını oluşturun ve Gemini API anahtarınızı ekleyin:
   ```
   GEMINI_API_KEY=sizin_api_anahtariniz
   ```

4. Uygulamayı başlatın:
   ```
   npm run dev
   ```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## Kullanım

1. Arama çubuğuna bir sorgu girin (örn. "İstanbul'daki tarihi yerler" veya "Paris'te bir gün")
2. Gün Planlayıcı modunu etkinleştirmek için sağ üst köşedeki düğmeyi kullanın
3. Haritada görüntülenen konumlar arasında gezinmek için alt kısımdaki kartları kullanın
4. Gün planı oluşturduğunuzda, sağ taraftaki zaman çizelgesini görüntüleyin
5. Planınızı dışa aktarmak için "Export" düğmesini kullanın

## Teknolojiler

- Next.js
- React
- TypeScript
- Leaflet (Açık kaynaklı harita kütüphanesi)
- Google Gemini AI API

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.