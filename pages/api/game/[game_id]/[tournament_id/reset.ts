import admin from "../../../../../serverFunctions/firebase/nodeApp";
// import { daily_getOrCreateRoomByName } from "../../../../serverFunctions/daily-utils";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  response_type: string;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { game_id, tournament_id } = req.query;
    const { user_id, team_ids = null } = req.body;
    console.log("make reference", game_id + "/tournaments/" + tournament_id);
    const tournamentRef = await admin
      .database()
      .ref(`${game_id}/tournaments/${tournament_id}`);

    const tournamentSnapshot = await tournamentRef.once("value");
    console.log("Does the tournamentSnapshot exist?");
    console.log(tournamentSnapshot.exists());
    if (!tournamentSnapshot.exists()) {
      console.log("sending tournament not found");
      res.json({
        response_type: "notfound",
        message: "tournament not found :" + game_id
      });
    } else {
      //   const gameRecord = tournamentSnapshot.val();
      //   console.log("got tournament", gameRecord);
      const teamsSnapshot = await tournamentRef.child("teams").once("value");
      //   const teamReset = teamsSnapshot.val().map(())
      let teamUpdates: { [key: string]: any } = {};
      teamsSnapshot.forEach(function (childSnapshot) {
        // key will be "ada" the first time and "alan" the second time
        var key = childSnapshot.key;
        // If this doesn't match team, then skip
        if (team_ids && !team_ids.includes(key)) return;
        // childData will be the actual contents of the child
        var childData = childSnapshot.val();
        teamUpdates["teams/" + key + "/answers"] = null;
        teamUpdates["teams/" + key + "/items"] = null;
        teamUpdates["teams/" + key + "/triggers"] = null;
        teamUpdates["teams/" + key + "/users"] = null;
      });
      console.log("teams", teamUpdates);
      tournamentRef.update(teamUpdates);
      res.json({
        response_type: "found",
        message: "tournament found :" + game_id
      });
    }
  } catch (err) {
    console.error(err); // will log the error with the error stack
    res.json({
      response_type: "tournament_error",
      message: "Error finding tournament"
    });
  }
}
