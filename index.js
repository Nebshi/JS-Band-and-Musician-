import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function saveDataToJson(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`Data sparad till ${filename}`);
}

function loadDataFromJson(filename) {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Fel vid inläsning av data från ${filename}: ${error.message}`);
    return null;
  }
}

class Musician {
  constructor(name, info, birthYear) {
    this.name = name;
    this.info = info;
    this.birthYear = birthYear;
    this.bands = [];
  }

  addBand(band, joinYear, instruments) {
    if (band instanceof Band && !this.bands.some((membership) => membership.band === band)) {
      const membership = { band, joinYear, instruments };
      this.bands.push(membership);
      band.addMember(this, joinYear, instruments);
    } else {
      console.error("Ogiltigt band-objekt eller musiker är redan medlem i bandet.");
    }
  }

  removeBand(band) {
    if (band instanceof Band) {
      const index = this.bands.findIndex((membership) => membership.band === band);
      if (index !== -1) {
        const membership = this.bands.splice(index, 1)[0];
        band.removeMember(this, membership.joinYear, membership.instruments);
        band.addToFormerMembers(this, membership.joinYear, new Date().getFullYear(), membership.instruments);
      } else {
        console.error("Denna musiker är inte medlem i bandet.");
      }
    } else {
      console.error("Ogiltigt band-objekt.");
    }
  }

  calculateAge() {
    const currentYear = new Date().getFullYear();
    return currentYear - this.birthYear;
  }

  serialize() {
    return JSON.stringify(this);
  }

  static deserialize(json) {
    const data = JSON.parse(json);
    return new Musician(data.name, data.info, data.birthYear);
  }
}

class BandMember {
  constructor(musician, joinYear, instruments) {
    this.musician = musician;
    this.joinYear = joinYear;
    this.instruments = instruments;
  }
}

class FormerBandMember {
  constructor(musician, joinYear, leaveYear, instruments) {
    this.musician = musician;
    this.joinYear = joinYear;
    this.leaveYear = leaveYear;
    this.instruments = instruments;
  }
}

class Band {
  constructor(name, info, formationYear, dissolutionYear = null) {
    this.name = name;
    this.info = info;
    this.formationYear = formationYear;
    this.dissolutionYear = dissolutionYear;
    this.currentMembers = [];
    this.formerMembers = [];
  }

  addMember(musician, joinYear, instruments) {
    if (musician instanceof Musician && !this.currentMembers.some((member) => member.musician === musician)) {
      const member = new BandMember(musician, joinYear, instruments);
      this.currentMembers.push(member);
      musician.addBand(this, joinYear, instruments);
    } else {
      console.error("Ogiltig musiker-objekt eller musiker är redan medlem i bandet.");
    }
  }

  removeMember(musician, joinYear, instruments) {
    if (musician instanceof Musician) {
      const index = this.currentMembers.findIndex((member) => member.musician === musician);
      if (index !== -1) {
        const member = this.currentMembers.splice(index, 1)[0];
        musician.removeBand(this, joinYear, instruments);
        this.addToFormerMembers(musician, joinYear, new Date().getFullYear(), instruments);
      } else {
        console.error("Denna musiker är inte medlem i bandet.");
      }
    } else {
      console.error("Ogiltig musiker-objekt.");
    }
  }

  addToFormerMembers(musician, joinYear, leaveYear, instruments) {
    this.formerMembers.push(new FormerBandMember(musician, joinYear, leaveYear, instruments));
  }

  serialize() {
    return JSON.stringify(this);
  }

  static deserialize(json) {
    const data = JSON.parse(json);
    return new Band(data.name, data.info, data.formationYear, data.dissolutionYear);
  }
}

function createMusician() {
  rl.question("Ange musikerns namn: ", (name) => {
    rl.question("Ange musikerns info: ", (info) => {
      rl.question("Ange födelseår: ", (birthYear) => {
        const musician = new Musician(name, info, parseInt(birthYear));
        musicians.push(musician);
        console.log(`Musiker ${musician.name} skapad.`);
        saveDataToJson('musicians.json', musicians);
        mainMenu();
      });
    });
  });
}

function createBand() {
  rl.question("Ange bandets namn: ", (name) => {
    rl.question("Ange bandets info: ", (info) => {
      rl.question("Ange bildande år: ", (formationYear) => {
        rl.question("Ange upplösning år (lämna tomt om bandet fortfarande existerar): ", (dissolutionYear) => {
          const band = new Band(name, info, parseInt(formationYear), dissolutionYear || null);
          bands.push(band);
          console.log(`Band ${band.name} skapat.`);
          saveDataToJson('bands.json', bands);
          mainMenu();
        });
      });
    });
  });
}

function removeBand() {
  rl.question("Ange bandets namn som ska tas bort: ", (bandName) => {
    const bandToRemove = bands.find((band) => band.name === bandName);
    if (bandToRemove) {
      bands = bands.filter((band) => band.name !== bandName);

      for (const member of bandToRemove.currentMembers) {
        member.musician.removeBand(bandToRemove);
      }
      console.log(`Band ${bandName} har tagits bort.`);
      saveDataToJson('bands.json', bands);
    } else {
      console.error("Bandet kunde inte hittas.");
    }
    mainMenu();
  });
}

