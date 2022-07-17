import { daily_getOrCreateRoomByName } from "../../../daily/daily-utils";

export default async function handler(req, res) {
  const { room_id, ...rest } = req.query;

  console.log(`Creating room ${room_id} on domain ${process.env.DAILY_DOMAIN}`);

  // Make sure there's a daily room for this tournament
  let roomObject = await daily_getOrCreateRoomByName(room_id);
  console.log("roomObject", roomObject);

  res.json({
    response_type: "room_found",
    ...roomObject
  });
}
