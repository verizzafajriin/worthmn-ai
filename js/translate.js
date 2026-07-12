/*==========================================
        WORTHMN TRANSLATION SYSTEM
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    const toggle = document.querySelector("#languageToggle");

    /*==========================================
        TRANSLATIONS
        (innerHTML is used, so inline tags like
        <br>, <span>, <strong> are kept intact)
    ==========================================*/
    const translations = {

        // NAVBAR
        "nav.beranda": { id: "Beranda", en: "Home" },
        "nav.panduan": { id: "Panduan", en: "Guide" },
        "nav.cta": { id: "Mulai Asesmen ✦", en: "Start Assessment ✦" },

        // HERO
        "hero.badge": { id: "❤️ Berbasis AI • Privat • Untuk Perempuan", en: "❤️ AI-Powered • Private • For Women" },
        "hero.title": {
            id: `Perempuan Kuat,<br>
                    Tapi Bukan Berarti<br>
                    <span> Harus Selalu Kuat🤍</span>`,
            en: `Strong Women,<br>
                    Doesn't Always Mean<br>
                    <span> You Have to Stay Strong🤍</span>`
        },
        "hero.desc": {
            id: `Worthmn AI membantu memahami kondisi
                    emosional, mendeteksi risiko dini, dan
                    memberikan insight personal untuk hidup
                    yang lebih seimbang.`,
            en: `Worthmn AI helps you understand your
                    emotional state, detect early risks, and
                    provides personal insight for a more
                    balanced life.`
        },
        "hero.cta": { id: "Cek Kondisimu Sekarang ✦", en: "Check Your Condition Now ✦" },

        // HOME SLIDER
        "home.badge": { id: "❣️ Ruang Aman Untuk Perempuan", en: "❣️ A Safe Space For Women" },
        "home.slide1.title": { id: `Halo, Kami <span> Worthmn </span>`, en: `Hello, We Are <span> Worthmn </span>` },
        "home.slide1.desc": {
            id: `Menjadi perempuan sering kali berarti menjalani banyak peran dalam satu waktu.
                    Di balik semua itu, ada hari ketika kamu merasa lelah, cemas, atau sekadar ingin
                    dipahami. Worthmn hadir sebagai ruang yang aman untuk menemanimu mengenali apa
                    yang sedang kamu rasakan.`,
            en: `Being a woman often means carrying many roles at once.
                    Behind it all, there are days when you feel tired, anxious, or simply want to be
                    understood. Worthmn is here as a safe space to help you recognize what
                    you're feeling.`
        },
        "home.slide2.desc": {
            id: `Tidak semua rasa lelah terlihat dari luar. Banyak perempuan memilih memendam
                perasaannya sendiri karena merasa harus tetap kuat, sibuk, atau takut dianggap
                berlebihan. Padahal, memahami kondisi emosional adalah langkah awal untuk
                menjaga kesehatan mental.`,
            en: `Not all exhaustion shows on the outside. Many women choose to bottle up
                their feelings because they feel they have to stay strong, stay busy, or fear
                being seen as overreacting. Yet understanding your emotional state is the
                first step to protecting your mental health.`
        },
        "home.slide3.title": { id: "AI membantu memahami, bukan menggantikan psikolog.", en: "AI helps you understand — it doesn't replace a psychologist." },
        "home.slide3.desc": {
            id: `Worthmn menggunakan AI sebagai teman refleksi awal untuk membantu kamu memahami
                kondisi emosionalmu melalui asesmen sederhana. Hasil asesmen bukan diagnosis
                medis, tetapi insight awal yang dapat membantumu menentukan langkah selanjutnya.`,
            en: `Worthmn uses AI as an early reflection companion to help you understand
                your emotional state through a simple assessment. The result is not a medical
                diagnosis, but an early insight that can help you decide your next step.`
        },
        "home.slide4.desc": {
            id: `Berbagai penelitian menunjukkan bahwa perempuan memiliki risiko lebih tinggi
                mengalami tantangan kesehatan mental dibandingkan laki-laki. Sayangnya, banyak
                yang tidak menyadarinya atau baru mencari bantuan ketika kondisinya sudah cukup
                berat.`,
            en: `Various studies show that women have a higher risk of facing mental health
                challenges compared to men. Unfortunately, many don't realize it or only seek
                help once their condition has become fairly severe.`
        },
        "home.slide4.cta": { id: "Yuk, lihat beberapa fakta yang melatarbelakangi hadirnya Worthmn.", en: "Let's look at some facts behind why Worthmn exists." },

        // CARDS
        "card1.title": { id: "Perempuan memiliki risiko hampir 2× lebih tinggi mengalami depresi dibandingkan laki-laki.", en: "Women have nearly 2× the risk of experiencing depression compared to men." },
        "card1.desc": {
            id: `Faktor biologis, hormonal, pengalaman hidup, dan 
                        tekanan sosial membuat perempuan lebih rentan mengalami 
                        depresi. Sayangnya, banyak gejala awal masih dianggap 
                        sebagai kelelahan atau stres biasa.`,
            en: `Biological, hormonal, life experience, and
                        social pressure factors make women more prone to
                        depression. Unfortunately, many early symptoms are still
                        dismissed as ordinary fatigue or stress.`
        },
        "card2.title": { id: "Gangguan kecemasan lebih sering dialami perempuan sepanjang hidupnya.", en: "Anxiety disorders are more commonly experienced by women throughout their lives." },
        "card2.desc": {
            id: `Perempuan memiliki kemungkinan lebih tinggi 
                        mengalami gangguan kecemasan akibat kombinasi 
                        faktor biologis, psikologis, dan pengalaman 
                        sosial yang berbeda dengan laki-laki.`,
            en: `Women are more likely to experience anxiety
                        disorders due to a combination of biological,
                        psychological, and social experience factors
                        that differ from men's.`
        },
        "card3.title": { id: "Banyak perempuan baru mencari bantuan ketika kondisinya sudah cukup berat.", en: "Many women only seek help once their condition has become fairly severe." },
        "card3.desc": {
            id: `Stigma, rasa bersalah, serta kebiasaan mengutamakan 
                        kebutuhan orang lain sering membuat perempuan menunda 
                        mencari pertolongan profesional.`,
            en: `Stigma, guilt, and the habit of prioritizing
                        others' needs often lead women to delay
                        seeking professional help.`
        },
        "card4.title": { id: "Deteksi dini dapat membantu mencegah kondisi berkembang menjadi lebih berat.", en: "Early detection can help prevent a condition from developing into something more severe." },
        "card4.desc": {
            id: `Mengenali perubahan emosi sejak awal memungkinkan 
                        seseorang mendapatkan dukungan lebih cepat sebelum 
                        gejala semakin mengganggu aktivitas sehari-hari.`,
            en: `Recognizing emotional changes early on allows
                        someone to get support sooner, before symptoms
                        interfere further with daily activities.`
        },
        "card5.title": { id: "AI dapat membantu proses skrining awal kesehatan mental, bukan menggantikan psikolog.", en: "AI can assist with early mental health screening — it doesn't replace a psychologist." },
        "card5.desc": {
            id: `Berbagai penelitian menunjukkan AI mampu membantu
                        mengidentifikasi pola gejala secara dini sehingga 
                        pengguna dapat memperoleh gambaran awal sebelum 
                        berkonsultasi dengan tenaga profesional.`,
            en: `Various studies show AI can help identify
                        symptom patterns early, so users can get an
                        initial picture before consulting a
                        professional.`
        },
        "card6.title": { id: "Dukungan yang tepat dimulai dari memahami apa yang sedang kamu rasakan.", en: "The right support starts with understanding what you're feeling." },
        "card6.desc": {
            id: `Worthmn membantu perempuan melakukan refleksi 
                        awal melalui asesmen berbasis AI secara privat.
                        Hasil asesmen bukan diagnosis medis, tetapi langkah
                        awal untuk memahami diri dan menentukan apakah
                        dukungan profesional diperlukan.`,
            en: `Worthmn helps women do an initial reflection
                        through a private AI-based assessment.
                        The result is not a medical diagnosis, but a first
                        step to understanding yourself and deciding whether
                        professional support is needed.`
        },
        "card.link": { id: "Lihat Penelitian ↗", en: "View Research ↗" },

        // FOOTER-HOME
        "footerhome.title": { id: "Tidak Perlu Terburu-buru.", en: "No Need to Rush." },
        "footerhome.desc": {
            id: `Mengenali diri sendiri bukan tentang mencari
                    apa yang salah, tetapi memberi ruang untuk memahami apa 
                    yang sedang dirasakan
                <span> Mari kita lihat Bagaimana Worthmn AI menemanimu </span>`,
            en: `Getting to know yourself isn't about finding
                    what's wrong, but about giving space to understand what
                    you're feeling
                <span> Let's see how Worthmn AI accompanies you </span>`
        },

        // GUIDE
        "guide.badge": { id: "❣️ Panduan", en: "❣️ Guide" },
        "guide.heading": { id: `Bagaimana <span>Worthmn</span> Menemanimu?`, en: `How Does <span>Worthmn</span> Accompany You?` },
        "guide.subtitle": {
            id: `Hanya membutuhkan 5–10 menit.
                <br>
                Tidak perlu persiapan khusus, cukup jawab pertanyaan
                dengan jujur sesuai dengan apa yang kamu rasakan.`,
            en: `It only takes 5–10 minutes.
                <br>
                No special preparation needed — just answer the questions
                honestly, based on what you're feeling.`
        },
        "guide.step1.title": { id: "Kenali Dirimu", en: "Get to Know Yourself" },
        "guide.step1.desc": { id: `Masukkan informasi dasar
                        pada form yang telah
                        disediakan.`, en: `Enter your basic information
                        into the form that's
                        provided.` },
        "guide.step2.title": { id: "Jawab Dengan Jujur", en: "Answer Honestly" },
        "guide.step2.desc": {
            id: `Tidak ada jawaban benar
                        ataupun salah.
                        Ceritakan apa yang
                        sedang kamu rasakan.`,
            en: `There's no right or
                        wrong answer.
                        Tell us what
                        you're feeling.`
        },
        "guide.step3.title": { id: "AI Menganalisis Jawabanmu", en: "AI Analyzes Your Answers" },
        "guide.step3.desc": {
            id: `AI mengenali pola jawaban
                        dan memberikan
                        gambaran awal kondisi
                        emosionalmu.`,
            en: `AI identifies patterns
                        in your answers and gives
                        an early picture of your
                        emotional state.`
        },
        "guide.step4.title": { id: "Dapatkan Insight Personal", en: "Get Personal Insight" },
        "guide.step4.desc": {
            id: `Kamu akan menerima
                        ringkasan hasil asesmen,
                        rekomendasi psikolog
                        maupun layanan online.`,
            en: `You'll receive
                        a summary of your assessment,
                        along with recommendations for
                        psychologists or online services.`
        },
        "guide.reminder.title": { id: "Penting Untuk Diketahui", en: "Important to Know" },
        "guide.reminder.desc": {
            id: `Worthmn bukan pengganti psikolog ataupun tenaga
                    kesehatan profesional. Hasil asesmen digunakan
                    sebagai langkah refleksi awal untuk membantu
                    memahami kondisi emosionalmu dan menentukan
                    apakah dukungan profesional sudah diperlukan.`,
            en: `Worthmn is not a substitute for a psychologist or
                    other health professional. The assessment result is
                    meant as an initial reflection step to help you
                    understand your emotional state and decide
                    whether professional support is needed.`
        },

        // ASSESSMENT
        "assessment.badge": { id: "❣️ AI Assessment", en: "❣️ AI Assessment" },
        "assessment.slide1.heading": { id: "Ceritakan Tentang Dirimu.", en: "Tell Us About Yourself." },
        "assessment.name.label": { id: "Nama (Opsional)", en: "Name (Optional)" },
        "assessment.city.label": { id: "Kota / Kabupaten", en: "City / Regency" },
        "assessment.district.label": { id: "Kecamatan", en: "District" },
        "assessment.next": { id: "Selanjutnya →", en: "Next →" },
        "assessment.prev": { id: "← Sebelumnya", en: "← Back" },
        "assessment.slide2.heading": { id: "Bagaimana Perasaanmu Hari Ini?", en: "How Are You Feeling Today?" },
        "assessment.slide2.desc": { id: `Pilih satu emosi yang paling menggambarkan
                        keadaanmu saat ini.`, en: `Choose one emotion that best
                        describes how you feel right now.` },
        "assessment.slide3.heading": { id: "Apa yang Sedang Kamu Rasakan?", en: "What's On Your Mind Right Now?" },
        "assessment.slide3.desc": {
            id: `Ceritakan apa yang sedang memenuhi pikiranmu.
                        Tidak ada jawaban yang benar ataupun salah.`,
            en: `Tell us what's been on your mind.
                        There's no right or wrong answer.`
        },
        "assessment.story.label": { id: "Ceritamu", en: "Your Story" },
        "assessment.start": { id: "Mulai Analisis ✨", en: "Start Analysis ✨" },
        "assessment.ai.greeting": { id: "Hai! 🤍", en: "Hi! 🤍" },
        "assessment.ai.desc": {
            id: `Setelah kamu menekan tombol
                        <strong>Mulai Analisis</strong>,
                        hasil asesmen, insight, serta
                        rekomendasi akan muncul di sini.`,
            en: `Once you press the
                        <strong>Start Analysis</strong> button,
                        your assessment result, insight, and
                        recommendations will appear here.`
        },

        // DAILY QUOTE
        "quote.heading": { id: "🤍 Setiap Perasaan Berharga", en: "🤍 Every Feeling Matters" },
        "quote.placeholder": { id: " Hasil ini hanya sebagai pendamping refleksi dan tidak dapat menggantikan pemeriksaan maupun diagnosis profesional, yaa.", en: "This insight is here to support your self-reflection and should not replace a professional evaluation or medical diagnosis" },

        // FAQ
        "faq.badge": { id: "❣️ Yang Sering Ditanyakan", en: "❣️ Frequently Asked Questions" },
        "faq1.q": { id: "Apakah Worthmn gratis?", en: "Is Worthmn free?" },
        "faq1.a": {
            id: `Ya. Seluruh proses asesmen awal dapat digunakan
                            tanpa biaya sehingga setiap perempuan dapat
                            memahami kondisi emosionalnya dengan lebih mudah.`,
            en: `Yes. The entire initial assessment process is free
                            to use, so every woman can more easily
                            understand her emotional state.`
        },
        "faq2.q": { id: "Apakah data saya aman?", en: "Is my data safe?" },
        "faq2.a": {
            id: `Ya. Jawaban yang kamu berikan hanya digunakan
                            untuk menghasilkan analisis dan rekomendasi.
                            Kami tidak membagikan data pribadimu kepada
                            pihak lain tanpa izin.`,
            en: `Yes. The answers you provide are only used
                            to generate the analysis and recommendations.
                            We do not share your personal data with
                            other parties without permission.`
        },
        "faq3.q": { id: "Apakah Worthmn menggantikan psikolog?", en: "Does Worthmn replace a psychologist?" },
        "faq3.a": {
            id: `Tidak. Worthmn membantu memberikan gambaran awal
                            mengenai kondisi emosionalmu. Diagnosis dan
                            penanganan tetap dilakukan oleh psikolog atau
                            tenaga kesehatan profesional.`,
            en: `No. Worthmn helps provide an initial picture
                            of your emotional state. Diagnosis and
                            treatment are still handled by a psychologist or
                            a health professional.`
        },
        "faq4.q": { id: "Bagaimana AI memberikan hasil?", en: "How does AI generate the results?" },
        "faq4.a": {
            id: `AI menganalisis pola jawaban yang kamu berikan,
                            kemudian menyusun insight berdasarkan model yang
                            telah dilatih menggunakan referensi ilmiah dan
                            pendekatan psikologi.`,
            en: `AI analyzes the patterns in the answers you give,
                            then compiles insight based on a model
                            trained using scientific references and
                            psychological approaches.`
        },
        "faq5.q": { id: "Apakah hasil assessment adalah diagnosis?", en: "Is the assessment result a diagnosis?" },
        "faq5.a": {
            id: `Tidak. Hasil yang diberikan merupakan refleksi
                            awal dan tidak dapat digunakan sebagai diagnosis
                            medis.`,
            en: `No. The result given is an initial reflection
                            and cannot be used as a medical
                            diagnosis.`
        },
        "faq6.q": { id: "Bagaimana jika saya membutuhkan bantuan segera?", en: "What if I need help right away?" },
        "faq6.a": {
            id: `Jika kamu merasa berada dalam kondisi krisis
                            atau memiliki keinginan untuk menyakiti diri
                            sendiri, segera hubungi psikolog, rumah sakit,
                            atau layanan darurat di sekitarmu.`,
            en: `If you feel you're in crisis
                            or have thoughts of harming
                            yourself, please contact a psychologist, hospital,
                            or emergency service near you right away.`
        },

        // FOOTER
        "footer.desc": { id: "Mendampingi perempuan mengenali kondisi emosionalnya melalui asesmen berbasis AI secara privat dan berbasis jurnal.", en: "Accompanying women in recognizing their emotional state through a private, journal-based AI assessment." },
        "footer.assessment": { id: "AI Assessment", en: "AI Assessment" },

        // EMOTIONS
        "emotion.senang": { id: "Senang", en: "Happy" },
        "emotion.tenang": { id: "Tenang", en: "Calm" },
        "emotion.semangat": { id: "Semangat", en: "Excited" },
        "emotion.bersyukur": { id: "Bersyukur", en: "Grateful" },
        "emotion.sedih": { id: "Sedih", en: "Sad" },
        "emotion.cemas": { id: "Cemas", en: "Anxious" },
        "emotion.lelah": { id: "Lelah", en: "Tired" },
        "emotion.ingin_menangis": { id: "Ingin Menangis", en: "Want to Cry" },
    };

    /*==========================================
        PLACEHOLDER TRANSLATIONS
    ==========================================*/
    const placeholders = {
        "assessment.name.placeholder": { id: "Nama kamu", en: "Your name" },
        "assessment.city.placeholder": { id: "Ketik nama kota / kabupaten", en: "Type your city / regency" },
        "assessment.district.placeholder": { id: "Ketik nama kecamatan", en: "Type your district" },
        "assessment.story.placeholder": { id: "Kamu bisa mulai cerita di sini...", en: "You can start writing here..." },
    };

    /*==========================================
        APPLY LANGUAGE
    ==========================================*/
    function applyLanguage(lang) {

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            const entry = translations[key];
            if (entry && entry[lang] !== undefined) {
                el.innerHTML = entry[lang];
            }
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            const entry = placeholders[key];
            if (entry && entry[lang] !== undefined) {
                el.setAttribute("placeholder", entry[lang]);
            }
        });

        document.documentElement.setAttribute("lang", lang);

        try {
            localStorage.setItem("worthmn-lang", lang);
        } catch (error) {
            console.warn("Tidak bisa menyimpan preferensi bahasa:", error);
        }
    }

    /*==========================================
        INIT
    ==========================================*/
    let savedLang = "id";

    try {
        savedLang = localStorage.getItem("worthmn-lang") || "id";
    } catch (error) {
        console.warn("Tidak bisa membaca preferensi bahasa:", error);
    }

    if (toggle) {
        toggle.checked = savedLang === "en";

        toggle.addEventListener("change", () => {
            applyLanguage(toggle.checked ? "en" : "id");
        });
    }

    applyLanguage(savedLang);

});