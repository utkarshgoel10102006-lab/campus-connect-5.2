// suggestions.js

const usernameSuggestions = [
  "MysteryCrush","CampusCupid","HiddenCharm","CupidCoder",
  "SoftHeartedSoul","SecretAdmirer","LoveStruckBoy","GirlWithDreams",
  "SparkOfDTU","RomanticVibes","PinkHeartbeat","DaydreamLover",
  "MoonlitVibes","CuteConfessor","SilentCharmer","CaffeinatedHeart"
];

const bioSuggestions = [
  "Trying my luck here… maybe you’re the one 😌",
  "Introvert until comfortable, then chaos 🫣",
  "Coffee + late night talks = perfection ☕💬",
  "Looking for someone to steal my hoodie 🥹",
  "Engineer by brain, romantic by heart 💘",
  "Not perfect, but probably your type 😉",
  "Let’s match vibes, not ego 💫",
  "Low-key hopeless romantic 😌",
  "Talk sweet, think deep, feel real 💭",
  "Craving genuine vibes only ✨"
];

const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];

$("username-suggest-btn").addEventListener("click", () => {
  $("username-input").value = randomFrom(usernameSuggestions);
});

$("bio-suggest-btn").addEventListener("click", () => {
  $("bio-input").value = randomFrom(bioSuggestions);
});
