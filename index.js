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

