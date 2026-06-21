let surveys =
    JSON.parse(
        localStorage.getItem("surveys")
    ) || [];

let surveyHistory =
    JSON.parse(
        localStorage.getItem("surveyHistory")
    ) || [];

let notifications =
    JSON.parse(
        localStorage.getItem("notifications")
    ) || [];

let fakeUsers = [
    { gender: "Male",   age: "18-22", status: "Mahasiswa" },
    { gender: "Female", age: "23-30", status: "Pekerja"   },
    { gender: "Male",   age: "23-30", status: "Mahasiswa" }
];

let withdrawals =
    JSON.parse(
        localStorage.getItem("withdrawals")
    ) || [];

/* ====================================
   HELPER: apply dark/light to wrappers
==================================== */

function applyWrapperTheme(){

    let isDark =
        document.body.classList.contains("dark");

    let historyWrapper =
        document.getElementById("historyWrapper");

    if(historyWrapper){
        if(isDark){
            historyWrapper.classList.add("bg-slate-800","text-white");
            historyWrapper.classList.remove("bg-white","text-slate-900");
        } else {
            historyWrapper.classList.add("bg-white","text-slate-900");
            historyWrapper.classList.remove("bg-slate-800","text-white");
        }
    }

    let notificationWrapper =
        document.getElementById("notificationWrapper");

    if(notificationWrapper){
        if(isDark){
            notificationWrapper.classList.add("bg-slate-800","text-white");
            notificationWrapper.classList.remove("bg-white","text-slate-900");
        } else {
            notificationWrapper.classList.add("bg-white","text-slate-900");
            notificationWrapper.classList.remove("bg-slate-800","text-white");
        }
    }

}

/* ====================================
   WINDOW ONLOAD
==================================== */

window.onload = function(){

    let savedTheme = localStorage.getItem("theme");
    if(savedTheme === "dark"){
        document.body.classList.add("dark");
    }

    updateThemeButton();
    applyWrapperTheme();

    let role = localStorage.getItem("role");

    roleText.innerText =
        role === "researcher" ? "Peneliti" : "Responden";

    if(role === "researcher"){

        researcherPanel.classList.remove("hidden");
        dashboardSubtitle.innerText =
            "Kelola survey dan temukan responden yang sesuai";

        walletAction.innerHTML = `
            <button
                onclick="deposit()"
                class="w-full bg-white text-indigo-600 font-semibold py-2 rounded-lg"
            >
                Deposit Dana
            </button>
        `;

        let featuredCheckbox =
            document.getElementById("featuredSurvey");
        if(featuredCheckbox){
            featuredCheckbox.addEventListener("change", calc);
        }

    }
    else if(role === "respondent"){

        respondentPanel.classList.remove("hidden");
        dashboardSubtitle.innerText =
            "Temukan survey yang sesuai dan dapatkan insentif";

        walletAction.innerHTML = `
            <button
                onclick="withdraw()"
                class="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
            >
                Withdraw
            </button>
        `;

        renderSurvey();
        renderHistory();

    }
    else if(role === "admin"){

        adminPanel.classList.remove("hidden");
        dashboardSubtitle.innerText =
            "Monitor performa platform";

        stats.style.display = "none";

        document.getElementById("wallet").innerText =
            "Platform Admin";

        walletAction.innerHTML = `
            <div class="text-center text-sm text-indigo-100">
                Admin Access
            </div>
        `;

        renderAdminStats();
        renderWithdrawals();
        renderDeletedSurveys();

    }

    updateWallet();
    updateStats();
    renderSurveyProgress();

    // FIX: renderNotifications dipanggil SEKALI di sini saja,
    // tidak lagi dipanggil di dalam tiap blok role agar tidak spam
    renderNotifications();

};

/* ====================================
   TOAST
==================================== */

function showToast(msg, type = "info"){

    let toast = document.getElementById("toast");

    toast.className =
        "fixed top-5 right-5 px-4 py-3 rounded-xl shadow-lg text-white z-50";

    if(type === "success"){
        toast.classList.add("bg-green-500");
    } else if(type === "error"){
        toast.classList.add("bg-red-500");
    } else {
        toast.classList.add("bg-blue-500");
    }

    toast.innerText = msg;
    toast.classList.remove("hidden");

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 2500);

}

/* ====================================
   WALLET
==================================== */

function updateWallet(){

    wallet.innerText =
        "Rp " +
        Number(
            localStorage.getItem("wallet")
        ).toLocaleString("id-ID");

}

/* ====================================
   PENELITI
==================================== */

function deposit(){

    let amount = prompt("Masukkan nominal deposit:");
    if(!amount) return;

    amount = Number(amount);

    if(amount <= 0){
        showToast("Nominal tidak valid","error");
        return;
    }

    let walletVal = Number(localStorage.getItem("wallet"));
    walletVal += amount;

    localStorage.setItem("wallet", walletVal);
    localStorage.setItem("surveys", JSON.stringify(surveys));

    updateWallet();
    showToast("Deposit berhasil","success");

    addNotification("💰 Deposit berhasil");
    renderNotifications();

}

/* ====================================
   RESPONDEN
==================================== */

function withdraw(){

    let amount = Number(prompt("Masukkan nominal withdraw"));

    if(!amount || amount <= 0) return;

    let walletVal = Number(localStorage.getItem("wallet"));

    if(amount > walletVal){
        showToast("Saldo tidak cukup","error");
        return;
    }

    withdrawals.push({
        id: Date.now(),
        amount: amount,
        status: "Pending"
    });

    localStorage.setItem("withdrawals", JSON.stringify(withdrawals));

    showToast("Request withdraw berhasil dibuat","success");

    addNotification("📤 Withdrawal request dibuat");
    renderNotifications();

}

/* ====================================
   LOGOUT
==================================== */

function logout(){
    localStorage.removeItem("role");
    localStorage.removeItem("gender");
    localStorage.removeItem("age");
    localStorage.removeItem("status");
    window.location.href = "index.html";
}

/* ====================================
   KALKULATOR INSENTIF
==================================== */

if(document.getElementById("insentif")){
    insentif.addEventListener("input", calc);
}

if(document.getElementById("count")){
    count.addEventListener("input", calc);
}

function calc(){

    let respondentCount = Number(count.value);
    let reward          = Number(insentif.value);
    let subtotal        = respondentCount * reward;
    let fee             = subtotal * 0.20;

    let featuredFee = 0;
    if(document.getElementById("featuredSurvey")?.checked){
        featuredFee = 5000;
    }

    let grandTotal = subtotal + fee + featuredFee;

    let subtotalElement  = document.getElementById("subtotal");
    let feeElement       = document.getElementById("platformFee");
    let featuredElement  = document.getElementById("featuredFee");
    let totalElement     = document.getElementById("total");

    subtotalElement.innerText =
        "Subtotal : Rp " + subtotal.toLocaleString("id-ID");

    featuredElement.innerText =
        featuredFee > 0
        ? "Featured Survey Fee : Rp " + featuredFee.toLocaleString("id-ID")
        : "";

    feeElement.innerText =
        "Platform Fee (20%) : Rp " + fee.toLocaleString("id-ID");

    totalElement.innerText =
        "Total Pembayaran : Rp " + grandTotal.toLocaleString("id-ID");

    let warning = document.getElementById("incentiveWarning");

    if(reward <= 5000){
        warning.className  = "text-green-400 text-sm";
        warning.innerText  = "✅ Rentang insentif rekomendasi";
    } else if(reward <= 20000){
        warning.className  = "text-yellow-400 text-sm";
        warning.innerText  = "⚠️ High Incentive Survey. Insentif di atas Rp 5.000 akan ditandai oleh sistem!";
    } else {
        warning.className  = "text-red-400 text-sm";
        warning.innerText  = "🚨 Very High Incentive Survey. Insentif di atas Rp 5.000 akan ditandai oleh sistem!";
    }

}

/* ====================================
   CREATE SURVEY
==================================== */

function createSurvey(){

    let title       = titleSurvey.value.trim();
    let c           = Number(count.value);
    let linkVal     = link.value.trim();
    let desc        = description.value.trim();
    let durationVal = Number(duration.value);
    let ins         = Number(insentif.value);

    match.innerText = "";

    if(!title || !c || !linkVal || !ins || !desc || !durationVal){
        showToast("Semua field harus diisi","error");
        return;
    }

    if(c <= 0){
        showToast("Jumlah responden harus > 0","error");
        return;
    }

    let subtotal     = c * ins;
    let fee          = subtotal * 0.20;
    let revenue      = Number(localStorage.getItem("revenue")) || 0;

    revenue += fee;
    localStorage.setItem("revenue", revenue);

    let totalPayment = subtotal + fee;
    let walletVal    = Number(localStorage.getItem("wallet"));

    if(walletVal < totalPayment){
        showToast("Saldo tidak cukup","error");
        return;
    }

    let matched = fakeUsers.filter(u =>
        (fGender.value === "All" || u.gender === fGender.value) &&
        (fAge.value    === "All" || u.age    === fAge.value   ) &&
        (fStatus.value === "All" || u.status === fStatus.value)
    );

    match.innerText = "Estimasi responden cocok : " + matched.length;

    walletVal -= totalPayment;
    localStorage.setItem("wallet", walletVal);

    let survey = {
        title,
        description  : desc,
        duration     : durationVal,
        count        : c,
        current      : 0,
        views        : 0,
        surveyStatus : "OPEN",
        link         : linkVal,
        insentif     : ins,
        featured     : document.getElementById("featuredSurvey").checked,
        gender       : fGender.value,
        age          : fAge.value,
        status       : fStatus.value
    };

    surveys.push(survey);
    localStorage.setItem("surveys", JSON.stringify(surveys));

    updateWallet();
    updateStats();
    renderSurveyProgress();

    showToast("Survey berhasil dibuat","success");

    addNotification(`📋 Survey "${title}" berhasil dibuat`);
    renderNotifications();

}

/* ====================================
   FILTER RESPONDEN
==================================== */

function resetFilter(){
    minPrice.value = "";
    renderSurvey();
    showToast("Filter direset","info");
}

function renderSurvey(){

    let user = {
        gender : localStorage.getItem("gender"),
        age    : localStorage.getItem("age"),
        status : localStorage.getItem("status")
    };

    let min     = Number(minPrice.value) || 0;
    let keyword = document.getElementById("searchSurvey")?.value.toLowerCase() || "";

    surveyList.innerHTML = "";

    let result = 0;

    let sortedSurvey =
        [...surveys].sort((a,b) => Number(b.featured) - Number(a.featured));

    sortedSurvey.forEach((s) => {

        if(
            (s.surveyStatus === "OPEN") &&
            (s.gender === "All" || s.gender === user.gender) &&
            (s.age    === "All" || s.age    === user.age   ) &&
            (s.status === "All" || s.status === user.status) &&
            (s.insentif >= min) &&
            (s.title.toLowerCase().includes(keyword))
        ){
            result++;

            // FIX: pakai index asli dari array surveys (bukan index hasil sort)
            // agar openSurveyModal/takeSurvey selalu merujuk survey yang benar
            let realIndex = surveys.indexOf(s);

            let progress = Math.round((s.current / s.count) * 100);

            // FEATURED VISUAL UPGRADE:
            // - selalu di atas (sudah ditangani lewat sortedSurvey)
            // - border kuning + shadow lebih terang + gradient tipis
            let cardClass = s.featured
                ? "relative bg-gradient-to-br from-yellow-50 to-white rounded-2xl shadow-lg shadow-yellow-200/60 p-5 hover:shadow-xl transition border-2 border-yellow-400"
                : "relative bg-white rounded-2xl shadow p-5 hover:shadow-xl transition border border-transparent";

            let featuredRibbon = s.featured
                ? `<div class="absolute -top-3 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow">
                       ⭐ FEATURED
                   </div>`
                : "";

            surveyList.innerHTML += `
            <div class="${cardClass}">
                ${featuredRibbon}
                <h3 class="font-bold text-lg ${s.featured ? "mt-2" : ""}">
                    ${s.title}
                </h3>
                <div class="mt-2">
                    <span class="px-2 py-1 rounded-full text-xs font-bold
                        ${s.surveyStatus === "OPEN" ? "bg-green-500 text-white" : "bg-red-500 text-white"}">
                        ${s.surveyStatus}
                    </span>
                </div>
                <p class="mt-2 text-sm truncate">${s.description}</p>
                <p class="mt-2">⏱ ${s.duration} menit</p>
                <p class="font-semibold mt-2">
                    Insentif : Rp ${Number(s.insentif).toLocaleString("id-ID")}
                </p>
                <p class="mt-2">Progress: ${s.current}/${s.count}</p>
                <div class="w-full bg-slate-600 rounded-full h-2 mt-2">
                    <div class="bg-green-500 h-2 rounded-full" style="width:${progress}%"></div>
                </div>
                <p class="text-sm mt-1">${progress}%</p>
                <button
                    onclick="openSurveyModal(${realIndex})"
                    class="mt-4 ${s.featured ? "bg-yellow-500 hover:bg-yellow-600" : "bg-indigo-600 hover:bg-indigo-700"} text-white px-4 py-2 rounded-lg w-full"
                >
                    Detail
                </button>
            </div>`;
        }
    });

    resultCount.innerText = result + " survey ditemukan";

    if(result === 0){
        surveyList.classList.add("hidden");
        emptyState.classList.remove("hidden");
    } else {
        surveyList.classList.remove("hidden");
        emptyState.classList.add("hidden");
    }

}

function renderHistory(){

    let historyList = document.getElementById("historyList");
    if(!historyList) return;

    historyList.innerHTML = "";

    let history =
        JSON.parse(localStorage.getItem("surveyHistory")) || [];

    if(history.length === 0){
        historyList.innerHTML = `<p class="text-gray-500">Belum ada survey yang dikerjakan</p>`;
        return;
    }

    history.slice().reverse().forEach(h => {
        historyList.innerHTML += `
        <div class="border-b py-3">
            <p class="font-semibold">${h.title}</p>
            <p class="text-sm">💰 Rp ${Number(h.insentif).toLocaleString("id-ID")}</p>
            <p class="text-xs text-gray-500">${h.date}</p>
        </div>`;
    });

}

/* ====================================
   SURVEY DETAIL MODAL
==================================== */

let currentModalIndex = null;

function openSurveyModal(i){

    let s = surveys[i];
    if(!s) return;

    currentModalIndex = i;

    // ANALYTICS: views bertambah saat responden membuka detail survey
    s.views = Number(s.views || 0) + 1;
    localStorage.setItem("surveys", JSON.stringify(surveys));

    let progress = Math.round((s.current / s.count) * 100);

    modalTitle.innerText       = s.title;
    modalDescription.innerText = s.description;
    modalDuration.innerText    = s.duration + " menit";
    modalInsentif.innerText    = "Rp " + Number(s.insentif).toLocaleString("id-ID");

    let targetParts = [];
    if(s.gender !== "All") targetParts.push(s.gender);
    if(s.age    !== "All") targetParts.push(s.age);
    if(s.status !== "All") targetParts.push(s.status);
    modalTarget.innerText = targetParts.length ? targetParts.join(" • ") : "Semua Responden";

    modalStatus.innerHTML = `
        <span class="px-2 py-1 rounded-full text-xs font-bold
            ${s.surveyStatus === "OPEN" ? "bg-green-500 text-white" : "bg-red-500 text-white"}">
            ${s.surveyStatus}
        </span>`;

    modalFeaturedBadge.innerHTML = s.featured
        ? `<span class="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">⭐ FEATURED</span>`
        : "";

    modalProgressLabel.innerText = `${s.current}/${s.count} (${progress}%)`;
    modalProgressBar.style.width = progress + "%";

    let takeBtn = document.getElementById("modalTakeSurveyBtn");
    if(s.surveyStatus === "OPEN"){
        takeBtn.disabled    = false;
        takeBtn.classList.remove("opacity-50","cursor-not-allowed");
        takeBtn.innerText   = "Isi Survey";
    } else {
        takeBtn.disabled    = true;
        takeBtn.classList.add("opacity-50","cursor-not-allowed");
        takeBtn.innerText   = "Survey Sudah Ditutup";
    }

    surveyModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

}

function closeSurveyModal(){

    surveyModal.classList.add("hidden");
    document.body.style.overflow = "";
    currentModalIndex = null;

}

function takeSurveyFromModal(){

    if(currentModalIndex === null) return;

    let index = currentModalIndex;
    closeSurveyModal();
    takeSurvey(index);

}

/* ====================================
   RESEARCHER: MANAGE SURVEY MODAL
   (Pause / Resume / Delete)
==================================== */

let currentResearcherModalIndex = null;

function openResearcherSurveyModal(i){

    let s = surveys[i];
    if(!s) return;

    currentResearcherModalIndex = i;

    let progress = Math.round((s.current / s.count) * 100);

    rModalTitle.innerText       = s.title;
    rModalDescription.innerText = s.description;
    rModalDuration.innerText    = s.duration + " menit";
    rModalInsentif.innerText    = "Rp " + Number(s.insentif).toLocaleString("id-ID");

    let targetParts = [];
    if(s.gender !== "All") targetParts.push(s.gender);
    if(s.age    !== "All") targetParts.push(s.age);
    if(s.status !== "All") targetParts.push(s.status);
    rModalTarget.innerText = targetParts.length ? targetParts.join(" • ") : "Semua Responden";

    let statusBadgeClass =
        s.surveyStatus === "OPEN"   ? "bg-green-500 text-white"  :
        s.surveyStatus === "PAUSED" ? "bg-yellow-500 text-white" :
                                       "bg-red-500 text-white";

    rModalStatus.innerHTML = `
        <span class="px-2 py-1 rounded-full text-xs font-bold ${statusBadgeClass}">
            ${s.surveyStatus}
        </span>`;

    rModalProgressLabel.innerText = `${s.current}/${s.count} (${progress}%)`;
    rModalProgressBar.style.width = progress + "%";

    // ANALYTICS: views, respondent (current), conversion = current/views * 100
    let viewsCount = Number(s.views || 0);
    let conversion = viewsCount > 0
        ? Math.round((s.current / viewsCount) * 100)
        : 0;

    rModalViews.innerText      = viewsCount;
    rModalRespondent.innerText = s.current;
    rModalConversion.innerText = conversion + "%";

    // Tombol aksi disusun sesuai restriksi:
    // OPEN   -> bisa Pause
    // PAUSED -> bisa Resume
    // CLOSED -> tidak bisa pause/resume (final state)
    // Delete selalu tersedia selama belum DELETED
    let actionsHTML = "";

    if(s.surveyStatus === "OPEN"){
        actionsHTML += `
            <button
                onclick="pauseSurvey(${i})"
                class="w-full bg-yellow-500 hover:bg-yellow-600 transition text-white py-3 rounded-lg font-semibold"
            >
                ⏸ Pause Survey
            </button>`;
    }
    else if(s.surveyStatus === "PAUSED"){
        actionsHTML += `
            <button
                onclick="resumeSurvey(${i})"
                class="w-full bg-green-500 hover:bg-green-600 transition text-white py-3 rounded-lg font-semibold"
            >
                ▶️ Resume Survey
            </button>`;
    }
    else if(s.surveyStatus === "CLOSED"){
        actionsHTML += `
            <p class="text-sm text-center text-gray-500 py-2">
                Survey sudah selesai (target tercapai) dan tidak bisa di-pause/resume lagi.
            </p>`;
    }

    actionsHTML += `
        <button
            onclick="deleteSurvey(${i})"
            class="w-full bg-red-500 hover:bg-red-600 transition text-white py-3 rounded-lg font-semibold"
        >
            🗑 Hapus Survey
        </button>`;

    rModalActions.innerHTML = actionsHTML;

    researcherSurveyModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

}

function closeResearcherSurveyModal(){

    researcherSurveyModal.classList.add("hidden");
    document.body.style.overflow = "";
    currentResearcherModalIndex = null;

}

function pauseSurvey(i){

    let s = surveys[i];
    if(!s || s.surveyStatus !== "OPEN") return;

    s.surveyStatus = "PAUSED";
    localStorage.setItem("surveys", JSON.stringify(surveys));

    closeResearcherSurveyModal();
    renderSurveyProgress();
    updateStats();

    showToast(`Survey "${s.title}" dipause`, "info");
    addNotification(`⏸ Survey "${s.title}" dipause`);
    renderNotifications();

}

function resumeSurvey(i){

    let s = surveys[i];
    if(!s || s.surveyStatus !== "PAUSED") return;

    s.surveyStatus = "OPEN";
    localStorage.setItem("surveys", JSON.stringify(surveys));

    closeResearcherSurveyModal();
    renderSurveyProgress();
    updateStats();

    showToast(`Survey "${s.title}" dilanjutkan`, "success");
    addNotification(`▶️ Survey "${s.title}" dilanjutkan`);
    renderNotifications();

}

function deleteSurvey(i){

    let s = surveys[i];
    if(!s || s.surveyStatus === "DELETED") return;

    let confirmDelete = confirm(
        `Hapus survey "${s.title}"?\n\nSurvey akan disembunyikan dari dashboard peneliti & responden, namun data tetap tersimpan untuk histori admin (soft delete).`
    );
    if(!confirmDelete) return;

    s.surveyStatus = "DELETED";
    localStorage.setItem("surveys", JSON.stringify(surveys));

    closeResearcherSurveyModal();
    renderSurveyProgress();
    updateStats();

    showToast(`Survey "${s.title}" dihapus`, "error");
    addNotification(`🗑 Survey "${s.title}" dihapus`);
    renderNotifications();

}

/* ====================================
   TAKE SURVEY
==================================== */

function takeSurvey(i){

    let walletVal = Number(localStorage.getItem("wallet"));
    walletVal    += Number(surveys[i].insentif);

    surveys[i].current++;

    if(
        surveys[i].current >= surveys[i].count &&
        surveys[i].surveyStatus !== "CLOSED"
    ){
        surveys[i].surveyStatus = "CLOSED";
        addNotification(`🎉 Survey "${surveys[i].title}" selesai`);
        renderNotifications();
    }

    localStorage.setItem("surveys", JSON.stringify(surveys));
    localStorage.setItem("wallet",  walletVal);

    let taken  = Number(localStorage.getItem("taken"))  || 0;
    let earned = Number(localStorage.getItem("earned")) || 0;

    taken++;
    earned += Number(surveys[i].insentif);

    localStorage.setItem("taken",  taken);
    localStorage.setItem("earned", earned);

    updateWallet();
    updateStats();
    renderSurvey();
    renderSurveyProgress();

    showToast("Insentif berhasil ditambahkan","success");

    surveyHistory.push({
        title   : surveys[i].title,
        insentif: surveys[i].insentif,
        date    : new Date().toLocaleString("id-ID")
    });

    localStorage.setItem("surveyHistory", JSON.stringify(surveyHistory));

    renderHistory();
    window.open(surveys[i].link, "_blank");

    addNotification(`✅ Survey "${surveys[i].title}" berhasil diisi`);
    renderNotifications();

}

/* ====================================
   STATS
==================================== */

function updateStats(){

    let role = localStorage.getItem("role");

    if(role === "researcher"){

        // Total Spent tetap dihitung dari SEMUA survey (termasuk yang sudah dihapus)
        // karena uangnya sudah terlanjur dipotong dari wallet saat createSurvey.
        let totalSpent = surveys.reduce((acc,s) => {
            let subtotal = s.count * s.insentif;
            let fee      = subtotal * 0.20;
            return acc + subtotal + fee;
        }, 0);

        // Survey yang DELETED tidak dihitung di Total Survey & Target Responden
        // karena dari sudut pandang peneliti, survey itu sudah "tidak ada".
        let visibleSurveys = surveys.filter(s => s.surveyStatus !== "DELETED");

        let totalSurvey      = visibleSurveys.length;
        let totalRespondent  = visibleSurveys.reduce((acc,s) => acc + Number(s.count), 0);

        stats.innerHTML = `
            <div class="bg-white p-4 rounded-xl shadow">
                <h3>Total Survey</h3>
                <p class="text-2xl font-bold">${totalSurvey}</p>
            </div>
            <div class="bg-white p-4 rounded-xl shadow">
                <h3>Total Pengeluaran</h3>
                <p class="text-2xl font-bold">Rp ${totalSpent.toLocaleString("id-ID")}</p>
            </div>
            <div class="bg-white p-4 rounded-xl shadow">
                <h3>Target Responden</h3>
                <p class="text-2xl font-bold">${totalRespondent}</p>
            </div>
            <div class="bg-white p-4 rounded-xl shadow">
                <h3>Saldo</h3>
                <p class="text-2xl font-bold">
                    Rp ${Number(localStorage.getItem("wallet")).toLocaleString("id-ID")}
                </p>
            </div>`;

    }
    else if(role === "respondent"){

        let taken  = Number(localStorage.getItem("taken"))  || 0;
        let earned = Number(localStorage.getItem("earned")) || 0;

        stats.innerHTML = `
            <div class="bg-white p-4 rounded-xl shadow">
                <h3>Survey Diambil</h3>
                <p class="text-2xl font-bold">${taken}</p>
            </div>
            <div class="bg-white p-4 rounded-xl shadow">
                <h3>Total Pendapatan</h3>
                <p class="text-2xl font-bold">Rp ${earned.toLocaleString("id-ID")}</p>
            </div>
            <div class="bg-white p-4 rounded-xl shadow">
                <h3>Saldo</h3>
                <p class="text-2xl font-bold">
                    Rp ${Number(localStorage.getItem("wallet")).toLocaleString("id-ID")}
                </p>
            </div>
            <div class="bg-white p-4 rounded-xl shadow">
                <h3>Survey Tersedia</h3>
                <p class="text-2xl font-bold">
                    ${surveys.filter(s => s.surveyStatus === "OPEN").length}
                </p>
            </div>`;

    }
    else if(role === "admin"){

        stats.innerHTML = "";

    }

}

/* ====================================
   DARK MODE
==================================== */

function toggleTheme(){

    document.body.classList.toggle("dark");

    let isDark = document.body.classList.contains("dark");

    localStorage.setItem("theme", isDark ? "dark" : "light");

    updateThemeButton();
    applyWrapperTheme();

    let role = localStorage.getItem("role");

    if(role === "admin"){
        renderAdminStats();
        renderWithdrawals();
        renderDeletedSurveys();
        renderNotifications();
    }

    if(role === "researcher"){
        renderSurveyProgress();
        renderNotifications();
    }

    if(role === "respondent"){
        renderSurvey();
        renderHistory();
        renderNotifications();
    }

}

function updateThemeButton(){

    let btn = document.getElementById("themeBtn");
    if(!btn) return;

    let isDark = document.body.classList.contains("dark");
    btn.innerText = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

}

function clearSurvey(){
    localStorage.removeItem("surveys");
    location.reload();
}

/* ====================================
   SURVEY PROGRESS
==================================== */

function renderSurveyProgress(){

    let container = document.getElementById("surveyProgress");
    if(!container) return;

    container.innerHTML = "";

    // Survey yang DELETED tidak ditampilkan di dashboard peneliti
    let visibleSurveys = surveys.filter(s => s.surveyStatus !== "DELETED");

    if(visibleSurveys.length === 0){
        container.innerHTML = `<p class="text-gray-500">Belum ada survey</p>`;
        return;
    }

    visibleSurveys.forEach(s => {

        let realIndex = surveys.indexOf(s);
        let progress  = Math.round((s.current / s.count) * 100);

        let statusBadgeClass =
            s.surveyStatus === "OPEN"   ? "bg-green-500 text-white"  :
            s.surveyStatus === "PAUSED" ? "bg-yellow-500 text-white" :
                                           "bg-red-500 text-white";

        // ANALYTICS: views & conversion rate (current / views * 100)
        let viewsCount  = Number(s.views || 0);
        let conversion  = viewsCount > 0
            ? Math.round((s.current / viewsCount) * 100)
            : 0;

        container.innerHTML += `
        <div
            onclick="openResearcherSurveyModal(${realIndex})"
            class="border rounded-lg p-3 mb-3 cursor-pointer hover:bg-slate-50 transition"
        >
            <h4 class="font-bold">${s.title}</h4>
            <p>${s.current}/${s.count}</p>
            <div class="w-full bg-slate-300 h-2 rounded-full mt-2">
                <div
                    class="${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'} h-2 rounded-full"
                    style="width:${progress}%"
                ></div>
            </div>
            <div class="flex gap-3 mt-2 text-xs text-slate-500">
                <span>👁 ${viewsCount} Views</span>
                <span>📈 ${conversion}% Conversion</span>
            </div>
            <div class="mt-2">
                <span class="px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClass}">
                    ${s.surveyStatus}
                </span>
            </div>
        </div>`;

    });

}

/* ====================================
   ADMIN STATS
==================================== */

function renderAdminStats(){

    const darkMode = document.body.classList.contains("dark");

    const wrapper = document.getElementById("businessWrapper");
    if(wrapper){
        wrapper.className = darkMode
            ? "bg-slate-800 text-white rounded-3xl p-8 shadow-lg"
            : "bg-white text-slate-900 rounded-3xl p-8 shadow-lg";
    }

    const withdrawWrapper = document.getElementById("withdrawWrapper");
    if(withdrawWrapper){
        withdrawWrapper.className = darkMode
            ? "bg-slate-700 text-white rounded-3xl p-6 shadow-lg mt-6"
            : "bg-slate-100 text-slate-900 rounded-3xl p-6 shadow-lg mt-6";
    }

    const cardClass    = darkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900";
    const subCardClass = darkMode ? "bg-slate-700 text-white rounded-2xl p-6" : "bg-slate-100 text-slate-900 rounded-2xl p-6";

    let adminStats      = document.getElementById("adminStats");
    let businessMetrics = document.getElementById("businessMetrics");

    if(!adminStats || !businessMetrics) return;

    let revenue = Number(localStorage.getItem("revenue")) || 0;

    // Survey DELETED tidak dihitung di statistik normal — ditampilkan terpisah
    let activeSurveysList = surveys.filter(s => s.surveyStatus !== "DELETED");

    let activeSurvey = activeSurveysList.filter(s => s.surveyStatus === "OPEN").length;
    let pausedSurvey = activeSurveysList.filter(s => s.surveyStatus === "PAUSED").length;
    let closedSurvey = activeSurveysList.filter(s => s.surveyStatus === "CLOSED").length;

    let totalInsentif = 0;
    activeSurveysList.forEach(s => {
        totalInsentif += Number(s.current || 0) * Number(s.insentif || 0);
    });

    adminStats.innerHTML = `
        <div class="${cardClass} rounded-2xl p-5 shadow">
            <h3>Total Survey</h3>
            <p class="text-3xl font-bold mt-2">${activeSurveysList.length}</p>
        </div>
        <div class="${cardClass} rounded-2xl p-5 shadow">
            <h3>Survey Aktif</h3>
            <p class="text-3xl font-bold mt-2">${activeSurvey}</p>
        </div>
        <div class="${cardClass} rounded-2xl p-5 shadow">
            <h3>Survey Selesai</h3>
            <p class="text-3xl font-bold mt-2">${closedSurvey}</p>
        </div>
        <div class="${cardClass} rounded-2xl p-5 shadow">
            <h3>Revenue</h3>
            <p class="text-3xl font-bold mt-2">Rp ${revenue.toLocaleString("id-ID")}</p>
        </div>`;

    businessMetrics.innerHTML = `
        <div class="${subCardClass}">
            <h3 class="font-semibold mb-3">📊 Statistik Pengguna</h3>
            <p>Total User : 3</p>
            <p>Survey Aktif : ${activeSurvey}</p>
            <p>Survey Dipause : ${pausedSurvey}</p>
            <p>Survey Selesai : ${closedSurvey}</p>
        </div>
        <div class="${subCardClass}">
            <h3 class="font-semibold mb-3">💰 Statistik Keuangan</h3>
            <p>Revenue : Rp ${revenue.toLocaleString("id-ID")}</p>
            <p>Total Insentif : Rp ${totalInsentif.toLocaleString("id-ID")}</p>
        </div>`;

    renderRevenueChart(revenue);
    renderTopSurvey();

}

/* ====================================
   ADMIN: REVENUE CHART (dummy 4 minggu)
   Minggu 1-3 = dummy kecil, Minggu 4 = revenue asli
   agar trend kelihatan naik (growth story untuk demo)
==================================== */

function renderRevenueChart(currentRevenue){

    let chart = document.getElementById("revenueChart");
    if(!chart) return;

    const darkMode = document.body.classList.contains("dark");

    const wrapper = document.getElementById("revenueChartWrapper");
    if(wrapper){
        wrapper.className = darkMode
            ? "rounded-3xl p-6 shadow-lg bg-slate-800 text-white"
            : "rounded-3xl p-6 shadow-lg bg-white text-slate-900";
    }

    // Dummy proporsional dari revenue saat ini, minggu terakhir = revenue asli.
    // Kalau revenue masih 0 (belum ada survey), tetap kasih dummy kecil
    // biar chart-nya tidak kosong total.
    let base = currentRevenue > 0 ? currentRevenue : 40000;

    let weeks = [
        { label: "Week 1", value: Math.round(base * 0.15) },
        { label: "Week 2", value: Math.round(base * 0.35) },
        { label: "Week 3", value: Math.round(base * 0.60) },
        { label: "Week 4", value: currentRevenue > 0 ? currentRevenue : Math.round(base * 1.0) }
    ];

    let maxValue = Math.max(...weeks.map(w => w.value), 1);

    chart.innerHTML = weeks.map(w => {
        let heightPercent = Math.max(Math.round((w.value / maxValue) * 100), 4);
        return `
        <div class="flex-1 flex flex-col items-center justify-end h-full">
            <p class="text-xs font-semibold mb-1 bar-label">
                ${w.value >= 1000 ? Math.round(w.value/1000) + "k" : w.value}
            </p>
            <div
                class="w-full bg-indigo-500 rounded-t-lg transition-all"
                style="height:${heightPercent}%"
            ></div>
            <p class="text-xs text-slate-400 mt-2 bar-label">${w.label}</p>
        </div>`;
    }).join("");

}

/* ====================================
   ADMIN: TOP SURVEY WIDGET
   Ranking top 3 berdasarkan views
==================================== */

function renderTopSurvey(){

    let list = document.getElementById("topSurveyList");
    if(!list) return;

    const darkMode = document.body.classList.contains("dark");

    const wrapper = document.getElementById("topSurveyWrapper");
    if(wrapper){
        wrapper.className = darkMode
            ? "rounded-3xl p-6 shadow-lg bg-slate-800 text-white"
            : "rounded-3xl p-6 shadow-lg bg-white text-slate-900";
    }

    // Survey DELETED tidak ikut diranking
    let ranked = surveys
        .filter(s => s.surveyStatus !== "DELETED")
        .slice()
        .sort((a,b) => Number(b.views || 0) - Number(a.views || 0))
        .slice(0, 3);

    if(ranked.length === 0){
        list.innerHTML = `<p class="text-gray-500">Belum ada data survey</p>`;
        return;
    }

    let medals = ["🥇", "🥈", "🥉"];
    let cardBg = darkMode ? "top-survey-card bg-slate-100" : "top-survey-card bg-slate-100";

    list.innerHTML = ranked.map((s, idx) => `
        <div class="${cardBg} rounded-xl p-3 mb-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <span class="text-2xl">${medals[idx]}</span>
                <div>
                    <p class="font-semibold text-sm">${s.title}</p>
                    <p class="text-xs text-slate-500">${Number(s.current || 0)} respondent</p>
                </div>
            </div>
            <p class="font-bold text-indigo-600">${Number(s.views || 0)} Views</p>
        </div>`
    ).join("");

}

/* ====================================
   ADMIN: SURVEY TERHAPUS (SOFT DELETE)
==================================== */

function renderDeletedSurveys(){

    let list = document.getElementById("deletedList");
    if(!list) return;

    const darkMode = document.body.classList.contains("dark");

    const deletedWrapper = document.getElementById("deletedWrapper");
    if(deletedWrapper){
        deletedWrapper.className = darkMode
            ? "bg-slate-700 text-white rounded-3xl p-6 shadow-lg mt-6"
            : "bg-slate-100 text-slate-900 rounded-3xl p-6 shadow-lg mt-6";
    }

    list.innerHTML = "";

    let deletedSurveys = surveys.filter(s => s.surveyStatus === "DELETED");

    if(deletedSurveys.length === 0){
        list.innerHTML = `<p class="text-gray-500">Belum ada survey yang dihapus</p>`;
        return;
    }

    deletedSurveys.forEach(s => {

        list.innerHTML += `
        <div class="border rounded-xl p-4 mb-3 opacity-75">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-semibold">${s.title}</p>
                    <p class="text-sm text-gray-500">Progress terakhir: ${s.current}/${s.count}</p>
                    <p class="text-sm text-gray-500">Insentif: Rp ${Number(s.insentif).toLocaleString("id-ID")}</p>
                </div>
                <span class="bg-slate-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    🗑 DELETED
                </span>
            </div>
        </div>`;

    });

}

/* ====================================
   TOGGLE SIDEBAR
==================================== */

function toggleSidebar(){

    let sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("w-72");
    sidebar.classList.toggle("w-20");

    document.getElementById("logoText")    ?.classList.toggle("hidden");
    document.getElementById("sidebarDesc") ?.classList.toggle("hidden");
    document.getElementById("walletbox")   ?.classList.toggle("hidden");
    document.getElementById("line")        ?.classList.toggle("hidden");
    document.getElementById("roleText")    ?.classList.toggle("hidden");
    document.getElementById("logoutbox")   ?.classList.toggle("hidden");

}

/* ====================================
   WITHDRAWALS
==================================== */

function renderWithdrawals(){

    let list = document.getElementById("withdrawList");
    if(!list) return;

    list.innerHTML = "";

    withdrawals =
        JSON.parse(localStorage.getItem("withdrawals")) || [];

    withdrawals.forEach((w, index) => {

        list.innerHTML += `
        <div class="border rounded-xl p-4 mb-3">
            <div class="flex justify-between items-center">
                <div>
                    <p class="font-semibold">Withdrawal Request</p>
                    <p>Rp ${w.amount.toLocaleString("id-ID")}</p>
                    <p class="text-sm text-gray-500">${w.status}</p>
                </div>
                ${
                    w.status === "Pending"
                    ? `<div class="flex gap-2">
                            <button onclick="approveWithdraw(${index})"
                                class="bg-green-500 text-white px-3 py-2 rounded-lg">
                                Approve
                            </button>
                            <button onclick="rejectWithdraw(${index})"
                                class="bg-red-500 text-white px-3 py-2 rounded-lg">
                                Reject
                            </button>
                        </div>`
                    : ""
                }
            </div>
        </div>`;

    });

}

function approveWithdraw(index){

    if(withdrawals[index].status !== "Pending") return;

    withdrawals[index].status = "Approved";

    let walletVal = Number(localStorage.getItem("wallet")) || 0;
    walletVal    -= Number(withdrawals[index].amount);

    localStorage.setItem("wallet",      walletVal);
    localStorage.setItem("withdrawals", JSON.stringify(withdrawals));

    renderWithdrawals();
    updateWallet();
    showToast("Withdraw approved","success");

    addNotification(
        `✅ Withdrawal Rp ${withdrawals[index].amount.toLocaleString("id-ID")} disetujui`
    );
    renderNotifications();

}

function rejectWithdraw(index){

    withdrawals[index].status = "Rejected";

    localStorage.setItem("withdrawals", JSON.stringify(withdrawals));

    renderWithdrawals();
    showToast("Withdraw rejected","error");

    addNotification(
        `❌ Withdrawal Rp ${withdrawals[index].amount.toLocaleString("id-ID")} ditolak`
    );
    renderNotifications();

}

/* ====================================
   NOTIFICATIONS
==================================== */

function addNotification(message){

    notifications.unshift({
        message,
        date: new Date().toLocaleString("id-ID")
    });

    localStorage.setItem("notifications", JSON.stringify(notifications));

}

function renderNotifications(){

    // FIX: pakai querySelector agar tidak bergantung pada posisi elemen di DOM
    let list = document.getElementById("notificationList");
    if(!list) return;

    list.innerHTML = "";

    let data = JSON.parse(localStorage.getItem("notifications")) || [];

    let notifCount = document.getElementById("notifCount");
    if(notifCount){
        notifCount.innerText = data.length;
    }

    if(data.length === 0){
        list.innerHTML = `<p class="text-gray-500">Belum ada notifikasi</p>`;
        return;
    }

    data.slice(0, 10).forEach(n => {
        list.innerHTML += `
        <div class="border-b border-slate-200 py-3">
            <p>${n.message}</p>
            <p class="text-xs text-gray-500">${n.date}</p>
        </div>`;
    });

}