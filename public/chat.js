/* =====================================================
   GAMEHUB CHAT SYSTEM
   Emotes, GIFs, Camera, Notifications-ready
   ===================================================== */

(function () {
  "use strict";

  const messagesEl = document.getElementById("chatMessages");
  const inputEl = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  const emojiBtn = document.getElementById("emojiBtn");
  const gifBtn = document.getElementById("gifBtn");
  const cameraBtn = document.getElementById("cameraBtn");

  const emojiPanel = document.getElementById("emojiPanel");
  const gifPanel = document.getElementById("gifPanel");
  const gifSearch = document.getElementById("gifSearch");
  const gifResults = document.getElementById("gifResults");

  const username = localStorage.getItem("username") || "Guest";

  /* =====================
     MESSAGE HANDLING
     ===================== */

  function addMessage(content, type = "text") {
    const msg = document.createElement("div");
    msg.className = "chat-message";

    const user = document.createElement("span");
    user.className = "chat-user";
    user.textContent = username + ":";

    msg.appendChild(user);

    if (type === "text") {
      const text = document.createElement("span");
      text.textContent = content;
      msg.appendChild(text);
    }

    if (type === "image") {
      const img = document.createElement("img");
      img.src = content;
      img.className = "chat-image";
      msg.appendChild(img);
    }

    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    triggerNotification();
  }

  sendBtn.onclick = sendMessage;
  inputEl.onkeydown = e => {
    if (e.key === "Enter") sendMessage();
  };

  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    addMessage(text);
    inputEl.value = "";
  }

  /* =====================
     EMOJIS
     ===================== */

  emojiBtn.onclick = () => {
    emojiPanel.classList.toggle("hidden");
    gifPanel.classList.add("hidden");
  };

  emojiPanel.onclick = e => {
    if (e.target.textContent.trim()) {
      inputEl.value += e.target.textContent;
    }
  };

  /* =====================
     GIFS (TENOR API READY)
     ===================== */

  gifBtn.onclick = () => {
    gifPanel.classList.toggle("hidden");
    emojiPanel.classList.add("hidden");
  };

  gifSearch.onkeydown = e => {
    if (e.key !== "Enter") return;

    gifResults.innerHTML = "";
    const query = gifSearch.value.trim();
    if (!query) return;

    fetch(
      `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
        query
      )}&key=LIVDSRZULELA&limit=6`
    )
      .then(r => r.json())
      .then(data => {
        data.results.forEach(gif => {
          const img = document.createElement("img");
          img.src = gif.media_formats.gif.url;
          img.onclick = () => {
            addMessage(img.src, "image");
            gifPanel.classList.add("hidden");
          };
          gifResults.appendChild(img);
        });
      });
  };

  /* =====================
     CAMERA
     ===================== */

  cameraBtn.onclick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;

      const snap = document.createElement("button");
      snap.textContent = "Snap";

      const wrapper = document.createElement("div");
      wrapper.appendChild(video);
      wrapper.appendChild(snap);

      messagesEl.appendChild(wrapper);

      snap.onclick = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 150;
        canvas.getContext("2d").drawImage(video, 0, 0, 200, 150);
        addMessage(canvas.toDataURL(), "image");
        stream.getTracks().forEach(t => t.stop());
        wrapper.remove();
      };
    } catch (err) {
      alert("Camera access denied");
    }
  };

  /* =====================
     NOTIFICATIONS (SETTINGS CONTROLLED)
     ===================== */

  function triggerNotification() {
    const enabled = localStorage.getItem("chatNotifications") === "on";
    if (!enabled) return;

    if (Notification.permission === "granted") {
      new Notification("New Chat Message");
    }
  }

  if ("Notification" in window) {
    Notification.requestPermission();
  }
})();
