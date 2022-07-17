// import stationsById from "https://framer.com/m/IMPORT-Stations-BlackCreek-2yi9.js@CHls6mK33HQn7pm3AOK1";

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import admin from "../../../../serverFunctions/firebase/nodeApp";
import { daily_getOrCreateRoomByName } from "../../../../serverFunctions/daily-utils";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  response_type: string;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const defaultTeamData = {
    displayName: "Team 1",
    createdAt: admin.database.ServerValue.TIMESTAMP
  };
  const defaultUserData = {
    displayName: "New Player",
    emoji: "🤪",
    tint: "#FF0099",
    createdAt: admin.database.ServerValue.TIMESTAMP
  };
  try {
    const { game_id, tournament_id } = req.query;
    const { user_id } = req.body;
    console.log("getting tournament", tournament_id);
    console.log("make reference", game_id + "/tournaments/" + tournament_id);
    const tournamentRef = await admin
      .database()
      .ref(`${game_id}/tournaments/${tournament_id}`);

    const teamsRef = await admin.database().ref(`${game_id}/teams/`);

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
      const gameRecord = tournamentSnapshot.val();
      console.log("got tournament", gameRecord);

      // If there is no team, create the first one
      const teamsInTournamentSnapshot = await tournamentRef
        .child("teams")
        .once("value");
      console.log("got teams", teamsInTournamentSnapshot.val());

      let teamsInTournamentVal;
      let firstTeamKey = null;
      if (!teamsInTournamentSnapshot.val()) {
        const firstTeam = await teamsRef.push();
        await firstTeam.set(defaultTeamData);
        firstTeamKey = firstTeam.key as string;
        tournamentRef.child(`teams`).set({ [firstTeamKey]: defaultTeamData });
      } else {
        // const firstTeamData = await tournamentRef
        //   .child(`teams`)
        // TODO USE CHILD FUNCTION TO GET THIS KEY
        const teamsInTournamentVal = teamsInTournamentSnapshot.val();
        console.log(
          "team exists, so get the first",
          Object.keys(teamsInTournamentVal)[0],
          teamsInTournamentVal[Object.keys(teamsInTournamentVal)[0]]
        );
        firstTeamKey = Object.keys(teamsInTournamentVal)[0];
      }

      const usersRef = await admin.database().ref(`${game_id}/users/`);

      // If user doesn't exist then create it
      console.log("checking users table", user_id);
      const userSnapshot = await usersRef.child(user_id).once("value");
      const userData = await userSnapshot.val();
      console.log("checking users table exists", userSnapshot.exists());
      if (!userSnapshot.exists()) {
        console.log("creating user in users table", user_id);
        usersRef.child(user_id).set(defaultUserData);
      }

      // If this user does not exists in the tournament, add them to the first team
      const usersInTournamentData = await tournamentRef
        .child("users")
        .child(user_id)
        .once("value");
      console.log("got users", usersInTournamentData.val());

      let usersTeamId = userData.team_id;
      if (!usersInTournamentData.exists()) {
        // If this user does not exists in the tournament, add them to the first team
        await tournamentRef
          .child(`users`)
          .child(user_id)
          .set({ team_id: firstTeamKey, ...defaultUserData });
        usersTeamId = firstTeamKey;
      } else if (!usersTeamId) {
        // If user doesn't have a team, add them to the first
        await tournamentRef
          .child(`users`)
          .child(user_id)
          .update({ team_id: firstTeamKey });
        usersTeamId = firstTeamKey;
      }

      console.log("got users data", userData);

      console.log("getting users team id", usersTeamId);

      // If the user's team doesn't exist in the tournament, assign them to the first team
      const usersTeamInTournamentData = await tournamentRef
        .child("teams")
        .child(usersTeamId)
        .once("value");
      console.log("got users team", usersTeamInTournamentData.val());

      if (!usersTeamInTournamentData.exists()) {
        usersRef.child(user_id).update({ team_id: firstTeamKey });
      }

      // Build structured response from users and teams
      const finalTeamsSnapshot = await tournamentRef
        .child("teams")
        .once("value");
      const finalTeamsData = finalTeamsSnapshot.val();

      const teamsByUserSnapshot = await tournamentRef
        .child("users")
        .once("value");

      const teamsByUserData = teamsByUserSnapshot.val();

      const teamsByUserReturn = {} as any;

      for (let userInTournamentId in teamsByUserData) {
        console.log("id", userInTournamentId);
        console.log("user", teamsByUserData[userInTournamentId]);
        let userInTournament = teamsByUserData[userInTournamentId];
        let team_id = userInTournament.team_id;
        let teamInTournament = finalTeamsData[team_id];
        if (!teamsByUserReturn[team_id]) {
          teamsByUserReturn[team_id] = {
            ...teamInTournament,
            participants: [userInTournament]
          };
        } else {
          teamsByUserReturn[team_id].participants.push(userInTournament);
        }
      }

      const tournamentReturn = {
        teams: teamsByUserReturn
      };

      // Make sure there's a daily room for this tournament
      let roomObject = await daily_getOrCreateRoomByName(
        tournament_id as string
      );
      console.log("roomObject", roomObject);

      res.json({
        response_type: "tournament_found",
        message: teamsByUserReturn
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
