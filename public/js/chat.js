const socket = io();

// Elements
const $chatForm = document.querySelector("#chatForm");
const $chatFromInput = $chatForm.querySelector("input");
const $chatFormBtn = $chatForm.querySelector("button");
const $sendLocationBtn = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { room, username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // New msg element
  const $newMsg = $messages.lastElementChild;

  // Height of the new msg
  const newMsgStyles = getComputedStyle($newMsg);
  const newMsgMargin = parseInt(newMsgStyles.marginBottom);
  const newMsgHeight = $newMsg.offsetHeight + newMsgMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far I've scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMsgHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    from: message.from,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (locationMsg) => {
  const html = Mustache.render(locationTemplate, {
    from: locationMsg.from,
    locationURL: locationMsg.url,
    createdAt: moment(locationMsg.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if ($chatFromInput.value) {
    $chatFormBtn.setAttribute("disabled", "disabled");
    socket.emit("sendMessage", $chatFromInput.value, (error) => {
      $chatFormBtn.removeAttribute("disabled");
      $chatFromInput.value = "";
      $chatFromInput.focus();
      if (error) {
        return console.log(error);
      }
      console.log("Message delivered!");
    });
  }
});

$sendLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  $sendLocationBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("sendLocation", { latitude, longitude }, () => {
      $sendLocationBtn.removeAttribute("disabled");
      console.log("Location shared!");
    });
  });
});

socket.emit("join", { room, username }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
