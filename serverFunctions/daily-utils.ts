const DAILY_EXPIRY = 3 * 60 * 60;
const DAILY_MINIMUM = 2 * 60 * 60;

export async function daily_updateRoomExpiry(room_name: string) {
  const privacy = "public";
  const getRoom_url = `https://api.daily.co/v1/rooms/${room_name}`;
  const getRoom_options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`
    },
    body: JSON.stringify({
      properties: {
        exp: Math.floor(Date.now() / 1000) + DAILY_EXPIRY
        // eject_at_room_exp: true,
        // enable_knocking: privacy !== "public",
      }
    })
  };
  return fetch(getRoom_url, getRoom_options)
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      return json;
    })
    .catch((err) => {
      console.error("error:" + err);
      return { error: "error:" + err };
    });
}

export const createDailyRoom = async () => {
  const privacy = "public";
  const expiryMinutes = 120;

  console.log(`Creating room on domain ${process.env.DAILY_DOMAIN}`);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`
    },
    body: JSON.stringify({
      privacy: privacy || "public",
      properties: {
        exp: Math.round(Date.now() / 1000) + (expiryMinutes || 5) * 60, // expire in x minutes
        eject_at_room_exp: true,
        enable_knocking: privacy !== "public"
      }
    })
  };

  const dailyRes = await fetch(
    `${process.env.DAILY_REST_DOMAIN || "https://api.daily.co/v1"}/rooms`,
    options
  );

  const { name, url, error } = await dailyRes.json();

  if (error) {
    return { code: 500, body: error };
  }

  return { code: 200, body: { name, url, domain: process.env.DAILY_DOMAIN } };
};
export async function daily_getOrCreateRoomByName(room_name: string) {
  let roomObject = await daily_getRoomByName(room_name);

  // If the room returns an error
  if (roomObject.error) {
    if (roomObject.error == "not-found") {
      // Then create the room
      roomObject = await daily_createRoomWithName(room_name);
    } else {
      // Uncaught error
      console.error("error when trying to fetch existing room");
    }
  }
  // TODO: Check the expiry
  if (roomObject?.config?.exp - Math.floor(Date.now() / 1000) < DAILY_MINIMUM) {
    console.log("expired, extend the room");
    daily_updateRoomExpiry(room_name);
  }
  // Return the room object
  return { roomObject };
}

export async function daily_createRoomWithName(
  room_name: string,
  screenshare = false
) {
  const createRoom_url = "https://api.daily.co/v1/rooms";
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`
    },
    body: JSON.stringify({
      name: room_name,
      properties: {
        enable_network_ui: false,
        enable_screenshare: screenshare,
        enable_chat: true,
        start_video_off: true,
        start_audio_off: false,
        owner_only_broadcast: false,
        eject_at_room_exp: true,
        exp: Math.floor(Date.now() / 1000) + DAILY_EXPIRY
      }
    })
  };
  return fetch(createRoom_url, options)
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      return json;
    })
    .catch((err) => {
      console.error("error:" + err);
      return { error: "error:" + err };
    });
}

export async function daily_getRoomByName(room_name: string) {
  const getRoom_url = `https://api.daily.co/v1/rooms/${room_name}`;
  // Expire in 2 hours from room creation
  const expiry_length = 120 * 60;
  const expiry_date = new Date(Date.now() + expiry_length);
  const getRoom_options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`
    }
  };
  return fetch(getRoom_url, getRoom_options)
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      return json;
    })
    .catch((err) => {
      console.error("error:" + err);
      return { error: "error:" + err };
    });
}
