const submit = document.getElementById("submit");

const checkSearch = (searchData) => {
  const searchVal = searchData.trim();
  if (searchVal == "about") return "/about";
  else if (searchVal == "prescription") return "/prescription";
  else if (searchVal == "appoinment") return "/appoinment";
  else if (searchVal == "other-details") return "/other-details";
  else if (searchVal == "hospital") return "/hospital";
  else if (searchVal == "clinic") return "/clinic";
  else if (searchVal == "pharmacy") return "/pharmacy";
  else if (searchVal == "laboratory") return "/laboratory";
  else if (searchVal == "diabetes" || searchVal == 'diabetes-report') return "/diabetes-report";
  else if (searchVal == "bp" || searchVal == "bp report") return "/bp-report";
};

submit.addEventListener("click", (event) => {
  const searchData = document.getElementById("search").value; 
  event.preventDefault();
  const searchResult = checkSearch(searchData);
  window.open('http://127.0.0.1:8081/dashboard/'+searchResult,'_blank');
});
