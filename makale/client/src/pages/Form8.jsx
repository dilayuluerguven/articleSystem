import React, { useState } from 'react';

// Form-8'de geçen statik seçim listeleri
const faaliyetTanimlariListesi = [
  { label: 'BAŞLICA ESER', key: 'baslicaEser' },
  { label: 'Tek Yazarlı Makale', key: 'tekYazarliMakale' },
  { label: 'Danışmanlığını yürüttüğü lisansüstü öğrenciler ile üretilen makaleler', key: 'danismanlikMakaleleri' },
  { label: 'Tezden', key: 'tezden' },
  { label: 'Tez Harici (Öğrencilik devam ederken)', key: 'tezHarici' },
  { label: 'Adayın Kendi Lisansüstü Tezlerinden Ürettiği Makaleler', key: 'adayinKendiTezlerinden' },
  { label: 'Yüksek Lisans Tezinden', key: 'yuksekLisansTezinden' },
  { label: 'Doktora/Sanatta Yeterlilik Tezinden', key: 'doktoraTezinden' },
  { label: 'Yürütücülüğünü yaptığı projelerden üretilmiş makale', key: 'projelerdenUretilmisMakale' },
  { label: 'Kitap yazarlığı', key: 'kitapYazarligi' },
  { label: 'DİĞER FAALİYET', key: 'digerFaaliyet' },
  { label: 'DOÇENTLİK SONRASI', key: 'docentlikSonrasi' },
  { label: 'DOKTORA SONRASI', key: 'doktoraSonrasi' },
];

// Veritabanından veri gelene kadar kullanılacak boş başlangıç state'i
const emptyInitialData = {
  yayinKodu: '',
  makaleBilgisi: '',
  seciliFaaliyetTanimlari: faaliyetTanimlariListesi.reduce((acc, item) => {
    acc[item.key] = false; // Tüm checkbox'ları başlangıçta boş (false) olarak ayarla
    return acc;
  }, {}),
};

const TailwindActivityForm = () => {
  // formData state'i, veritabanından çekilecek verilerle dolmaya hazır.
  const [formData, setFormData] = useState(emptyInitialData);
  // Yükleme durumu, veritabanı bağlantısı kurulduğunda kullanılabilir.
  const [loading, setLoading] = useState(false);

  // Genel input alanları için değişiklik yöneticisi
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Checkbox (Faaliyet Tanımı) değişiklik yöneticisi
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      seciliFaaliyetTanimlari: {
        ...prevData.seciliFaaliyetTanimlari,
        [name]: checked
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Gönderilecek Veri:', formData);
    // Veritabanı (API) gönderme işlemi burada yapılacaktır.
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-blue-600">Veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-6 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 pb-2 mb-6">
          FORM-8 Akademik Faaliyet Beyan Formu
        </h2>

        {/* Makale Bilgileri Alanı */}
        <div className="border border-gray-200 p-4 rounded-md space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Akademik Faaliyet Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-2 bg-gray-50 border-t">
            <label htmlFor="yayinKodu" className="font-medium col-span-1 text-gray-600">YAYIN KODU:</label>
            <input
              type="text"
              id="yayinKodu"
              name="yayinKodu"
              value={formData.yayinKodu}
              onChange={handleInputChange}
              readOnly
              className="col-span-3 p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 focus:outline-none"
              placeholder="Veritabanından gelecek A-1a:1 gibi kod"
            />
          </div>
          <div className="p-2 border-t">
            <label htmlFor="makaleBilgisi" className="font-medium block mb-2 text-gray-600">AKADEMİK FAALİYET : MAKALE</label>
            <textarea
              id="makaleBilgisi"
              name="makaleBilgisi"
              value={formData.makaleBilgisi}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Makalenin tam künyesi veritabanından buraya gelecek..."
            />
          </div>
        </div>

        {/* Faaliyet Tanımı Checkbox Alanı */}
        <div className="border border-gray-200 p-4 rounded-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">FAALİYET TANIMI (Sadece işaretlenecek)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
            {faaliyetTanimlariListesi.map((tanim) => (
              <div key={tanim.key} className="flex items-start">
                <input
                  type="checkbox"
                  id={tanim.key}
                  name={tanim.key}
                  checked={formData.seciliFaaliyetTanimlari[tanim.key]}
                  onChange={handleCheckboxChange}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={tanim.key} className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                  {tanim.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Not ve Şartlar Alanı (Statik İçerik) */}
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <p className="text-sm text-yellow-800">
              <span className="font-bold">Not:</span> FORM-8 ’in devamında faaliyetin kendisi ve ilgili belgeler yer almalıdır.
              Yükseköğretim Kurulu'nun Yağmacı/Şaibeli dergilerle ilgili güncel kararları dikkate alınacak ve bu tür dergilerde yayımlanmış makaleler değerlendirmeye alınmayacaktır. Belirtilen yağmacı/şaibeli dergilerde yapılan yayınlar dosyada yer almalıdır ancak puanlandırılmamalıdır.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
            <p className="text-sm font-bold text-blue-800 mb-2">
              Buna göre aday, A kategorisinde beyan ettiği makalenin yayınlandığı derginin şaibeli dergiler sınıfına girmediğini gösteren aşağıdaki şartların hangisini/hangilerini sağladığını kanıtlayan belgeyi eklemelidir:
            </p>
            <h4 className="text-md font-semibold text-blue-700 mb-2">Şaibeli Olmayan Dergi Kriterleri (YÖK Kararı 30.12.2021):</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
              <li>WEB of Science’de Q1, Q2, Q3 sınıfında yer alan dergiler (Editöryal ve/veya basım süreçlerinde ücret talep eden veya etmeyen),</li>
              <li>WEB of Science’de Q4 sınıfında yer alıp editöryal (editorial processing charge) ve/veya basım sürecinde (article processing charge) ücret talep etmeyen dergiler,</li>
              <li>WEB of Science’de Q4 sınıfında yer alıp editöryal ve/veya basım süreçlerinde ücret talep etmekle birlikte sadece ilgili bilim alanı mensuplarının üye olabildiği bir branş derneğinin, üniversitenin, enstitünün veya bilimsel bir kurumun yayın organı olan ve 2010 yılı öncesinden itibaren basılmakta/yayınlanmakta olup abone usulü olarak çalışan ulusal/uluslararası dergiler.</li>
            </ul>
          </div>
        </div>

        {/* Gönder Butonu */}
        <button
          type="submit"
          className="w-full py-3 mt-6 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Formu Kaydet ve Veritabanına Gönder
        </button>
      </form>
    </div>
  );
};

export default TailwindActivityForm;