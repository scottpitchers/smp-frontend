export const mockContent = [
  {
    id: "c1",
    name: "Welcome Video",
    type: "video",
    url: "https://example.com/welcome.mp4",
    duration: "30s",
    size: "15 MB",
  },
  {
    id: "c2",
    name: "Promo Slideshow",
    type: "playlist",
    items: 5,
    duration: "2m",
    size: "8 MB",
  },
  {
    id: "c3",
    name: "Menu Board",
    type: "image",
    url: "https://example.com/menu.jpg",
    duration: "static",
    size: "2 MB",
  },
];

export const mockSchedules = [
  {
    id: "s1",
    name: "Morning Content",
    content: "Welcome Video",
    time: "08:00-12:00",
    days: "Mon-Fri",
    players: 2,
  },
  {
    id: "s2",
    name: "Lunch Menu",
    content: "Menu Board",
    time: "11:00-14:00",
    days: "Daily",
    players: 1,
  },
];

export const mockPlayers = [
  {
    id: "p1",
    name: "Lobby Display",
    status: "online",
    location: "Main Entrance",
    content: "Morning Content",
    uptime: "2d 4h",
  },
  {
    id: "p2",
    name: "Cafeteria Menu",
    status: "online",
    location: "Cafeteria",
    content: "Lunch Menu",
    uptime: "5h 20m",
  },
  {
    id: "p3",
    name: "Hallway Sign",
    status: "offline",
    location: "2nd Floor Hallway",
    content: "None",
    uptime: "0h",
  },
];
