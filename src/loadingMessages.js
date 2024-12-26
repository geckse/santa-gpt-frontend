export const loadingMessages = [
    "Santa is reading your message... 📜",
    "Santa is preparing the sleigh... 🛷",
    "Checking the nice list... ✨",
    "Consulting with the elves... 🧝‍♂️",
    "Feeding the reindeer... 🦌",
    "Warming up by the fireplace... 🔥",
    "Reviewing Christmas wishes... 🎁",
    "Polishing the sleigh bells... 🔔",
    "Checking gift inventory... 📦",
    "Making hot cocoa... ☕",
    "Wrapping presents... 🎀",
    "Adjusting his hat... 🎅"
];

export function getRandomLoadingMessage() {
    return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
}