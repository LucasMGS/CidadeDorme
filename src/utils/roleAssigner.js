import { ROLES } from '../constants/roles';

export const assignRolesToPlayers = (players) => {
  const numPlayers = players.length;
  let rolesToAssign = [];

  if (numPlayers >= 8) rolesToAssign = [ROLES.LOBO, ROLES.LOBO, ROLES.VIDENTE, ROLES.MEDICO, ROLES.FEITICEIRA, ROLES.CACADOR];
  else if (numPlayers >= 7) rolesToAssign = [ROLES.LOBO, ROLES.FEITICEIRA, ROLES.VIDENTE, ROLES.MEDICO, ROLES.CACADOR];
  else if (numPlayers >= 5) rolesToAssign = [ROLES.LOBO, ROLES.VIDENTE, ROLES.MEDICO, ROLES.FEITICEIRA];
  else if (numPlayers >= 4) rolesToAssign = [ROLES.LOBO, ROLES.VIDENTE, ROLES.MEDICO];
  else if (numPlayers === 3) rolesToAssign = [ROLES.LOBO, ROLES.MEDICO, ROLES.CACADOR];
  else if (numPlayers === 2) rolesToAssign = [ROLES.LOBO, ROLES.VIDENTE];
  
  while (rolesToAssign.length < numPlayers) {
    rolesToAssign.push(ROLES.ALDEAO);
  }

  for (let i = rolesToAssign.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rolesToAssign[i], rolesToAssign[j]] = [rolesToAssign[j], rolesToAssign[i]];
  }

  return players.map((player, index) => ({ 
    ...player, 
    role: rolesToAssign[index],
    isAlive: true 
  }));
};
