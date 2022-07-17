import admin from "../../../../../serverFunctions/firebase/nodeApp";
// import { daily_getOrCreateRoomByName } from "../../../../../daily/daily-utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { checkTriggers } from "../../../../../serverFunctions/serverFunctions";

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
    const { user_id, answer_id, team_ids = null } = req.body;
    console.log("make reference", game_id + "/tournaments/" + tournament_id);

    const gameStructureRef = await admin
      .database()
      .ref(`${game_id}/structure/`);
    const gameStructureSnapshot = (await gameStructureRef.once("value")) as any;
    const gameStructureData = gameStructureSnapshot.val();
    console.log(
      "structure levels",
      Object.keys(gameStructureData.levels),
      gameStructureData.triggers,
      Object.keys(gameStructureData.triggers)
    );
    // const levelMappings ={};
    // for (let triggerSetIndex in Object.keys(gameStructureData.triggers)) {
    //   let triggertSetData = gameStructureData.triggers[triggerSetIndex]
    //   for (let triggerSetIndex in Object.keys(gameStructureData.triggers)) {
    //     levelMappings["answer_1"]
    //   }
    //   console.log(triggerSetIndex);
    // }

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
        var team_id = childSnapshot.key;
        // If this doesn't match team, then skip
        console.log("team ids", team_ids);
        // If there is no team_ids array then set all teams
        if (!team_id || (team_ids && !team_ids.includes(team_id))) return;
        // childData will be the actual contents of the child
        var childData = childSnapshot.val();

        teamUpdates["teams/" + team_id + "/answers/" + answer_id] = {
          solved: true,
          answer_id,
          by: user_id,
          at: admin.database.ServerValue.TIMESTAMP
        };
        checkTriggers(game_id, tournament_id, team_id, user_id);
      });
      console.log("update team answers", teamUpdates);
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
