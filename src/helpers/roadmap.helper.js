// Function to get the index of the level based on its priority
function getLevelIndex(level) {
  switch (level) {
      case 'Beginner':
          return 0;
      case 'Intermediate':
          return 1;
      case 'Advanced':
          return 2;
      default:
          return -1; // If level is not recognized, return -1
  }
}

function removeDuplicates(array) {
  const map = new Map();

  // Iterate over each object in the array
  for (const obj of array) {
      // Convert mongoose ObjectId to string for comparison
      const skillString = obj.skill.toString();
      // If map already contains an object with the same skill
      if (map.has(skillString)) {
          const existingObj = map.get(skillString);
          // Compare levels and keep the one with higher preference
          if (getLevelIndex(obj.level) < getLevelIndex(existingObj.level)) {
              continue; // Skip current object if the existing one has a higher level
          }
      }
      // If no duplicate found or current object has higher level, update map
      map.set(skillString, obj);
  }

  // Return array of unique objects
  return Array.from(map.values());
}

const convertRequirements = (requirements, certificateObjects, majorObjects) => {
  let skills = requirements.filter((item) => item.type === 'Skill').map(obj => {
    return {
      level: obj.level,
      skill: obj.skills[0].name,
      _id: obj.skills[0].id,
    }
  });
  const certificateIds = requirements.filter((item) => item.type === 'Certificate').map(obj => obj.certificates[0].id.toString());
  const majorIds = requirements.filter((item) => item.type === 'Major').map(obj => obj.majors[0].id.toString());
  let userCertificateSubjects = certificateObjects.filter((item) => certificateIds.includes(item.certificate.toString()))
                                                  .map((item) => item.subject_objects.map((iitem) => {
                                                    return {
                                                      ...iitem.toObject(),
                                                      certificate: item.certificate,
                                                    }
                                                  }))
                                                  .flat()
                                                  .map((item) => {
                                                    return {
                                                      level: item.level,
                                                      skill: item.subject.name,
                                                      _id: item.subject._id,
                                                      certificate: item.certificate,
                                                    }
                                                  })
  let userMajorSubjects = majorObjects.filter((item) => majorIds.includes(item.major.toString()))
                                                  .map((item) => item.subject_objects.map((iitem) => {
                                                    return {
                                                      ...iitem.toObject(),
                                                      major: item.major,
                                                    }
                                                  }))
                                                  .flat()
                                                  .map((item) => {
                                                    return {
                                                      level: item.level,
                                                      skill: item.subject.name,
                                                      _id: item.subject._id,
                                                      major: item.major,
                                                    }
                                                  })
  skills = removeDuplicates(skills.concat(userCertificateSubjects, userMajorSubjects));
  return skills;
}

module.exports = {
  convertRequirements,
}
