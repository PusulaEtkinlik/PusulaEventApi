const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

const usercode = process.env.NETGSM_USERCODE;
const password = process.env.NETGSM_PASSWORD;
const header = process.env.NETGSM_HEADER;

app.use(cors());
app.use(express.json());

app.post("/send-sms", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    console.log("❌ Eksik parametre:", { to, message });
    return res.status(400).json({ success: false, error: "Eksik parametre" });
  }

  try {
    console.log("📤 SMS gönderimi başlatıldı");
    console.log("🧾 Telefon:", to);
    console.log("💬 Mesaj:", message);

    const payload = `
      <mainbody>
        <header>
          <company>NETGSM</company>
          <usercode>${usercode}</usercode>
          <password>${password}</password>
          <type>1:n</type>
          <msgheader>${header}</msgheader>
        </header>
        <body>
          <msg><![CDATA[${message}]]></msg>
          <no>${to}</no>
        </body>
      </mainbody>
    `.trim();

    const response = await axios.post("https://api.netgsm.com.tr/sms/send/xml", payload, {
      headers: {
        "Content-Type": "application/xml",
      },
    });

    // Başarılıysa içeriği kontrol edebilirsin
    console.log("Netgsm yanıtı:", response.data);

    if (response.data.includes("00")) {
      console.log("✅ SMS başarıyla gönderildi.");
      return res.status(200).json({ success: true });
    } else {
      console.log("⚠️ Netgsm hata yanıtı:", response.data);
      return res.status(500).json({ success: false, error: response.data });
    }
  } catch (err) {
    console.error("SMS gönderim hatası:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Netgsm SMS sunucusu çalışıyor http://localhost:${PORT}/send-sms`);
});