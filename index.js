const fileInput = document.getElementById("file-input");
const fileContents = document.getElementById("file-contents");
const reader = new FileReader();

const turnIntoObject = (employee) => {
  employee = employee.split(", ");
  if (employee[3].trim() == "NULL") {
    employee[3] = new Date().toISOString();
  }
  return {
    employeeId: employee[0],
    projectId: employee[1],
    dateFrom: new Date(employee[2]),
    dateTo: new Date(employee[3])
  };
}

const findUniqueProjectIds = (employees) => {
  let projectIds = [];
  employees.forEach((employee) => {
    projectIds.push(employee.projectId);
  })
  return new Set(projectIds);
}

const compareDates = (emp1, emp2) => {
  emp1.begin = emp1.dateFrom.getTime();
  emp1.end = emp1.dateTo.getTime();
  emp2.begin = emp2.dateFrom.getTime();
  emp2.end = emp2.dateTo.getTime();

  if (emp1.begin === emp2.begin) return Math.min(emp1.end, emp2.end) - emp1.begin;
  if (emp1.end === emp2.end) return emp1.end - Math.max(emp1.begin, emp2.begin);

  if ((emp1.begin - emp2.begin < 0 && emp1.begin - emp2.end < 0)) {
    if (emp1.end - emp2.begin > 0){
      if (emp1.end - emp2.end > 0) {
        return emp2.end - emp2.begin;
      } else {
        return emp1.end - emp2.begin;
      }
    } 
  }
  return 0;
  
}

const findMostDaysWorked = (employees, projectIds) => {
  let mostDaysWorkedTeam = {
    maxTime: 0
  };
  // iterate over each project Id 
  projectIds.forEach((pId) => {
    // gets all the employees with the same project Ids
    const sameProjectIdEmployees = employees.filter((emp) => emp.projectId === pId);
    // compare each employee with one another 
    sameProjectIdEmployees.forEach((emp1, index1) => {
      sameProjectIdEmployees.forEach((emp2, index2) => {
        if (index1 !== index2) {
          const timeStamp = compareDates(emp1, emp2);
          // checks for the most amount of time spent on a project together
          if (timeStamp > mostDaysWorkedTeam.maxTime) {
            mostDaysWorkedTeam.maxTime = timeStamp;
            mostDaysWorkedTeam.employee1 = emp1;
            mostDaysWorkedTeam.employee2 = emp2;
            mostDaysWorkedTeam.projectId = emp1.projectId;
          }
        }
      });
    });
  })

  return mostDaysWorkedTeam;
}

const displayData = (mostDaysWorkedTeam) => {
  const tr = document.createElement("tr");
  const td1 = document.createElement("td");
  td1.textContent = mostDaysWorkedTeam.employee1.employeeId;

  const td2 = document.createElement("td");
  td2.textContent = mostDaysWorkedTeam.employee2.employeeId;

  const td3 = document.createElement("td");
  td3.textContent = mostDaysWorkedTeam.projectId;

  const td4 = document.createElement("td");
  td4.textContent = (mostDaysWorkedTeam.maxTime/(1000 * 3600 * 24)).toFixed();

  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  tr.appendChild(td4);

  const table = document.getElementById("datagrid");
  table.appendChild(tr);
  table.classList.remove("hidden");
}

reader.addEventListener('load', (ev) => {
  let employees = ev.target.result.split("\n");
  employees = employees.map(employee => turnIntoObject(employee));
  const uniqueProjectIds = findUniqueProjectIds(employees);
  const mostDaysWorkedTeam = findMostDaysWorked(employees, uniqueProjectIds);
  displayData(mostDaysWorkedTeam);
})

fileInput.addEventListener("change", (ev) => {
  reader.readAsText(ev.target.files[0]);
});
