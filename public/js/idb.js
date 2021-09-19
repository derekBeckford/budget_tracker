let db;

const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    uploadTransactions();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["new_transaction"], "readwrite");
  const budjectObjectStore = transaction.objectStore("new_transaction");
  budjectObjectStore.add(record);
}

function uploadTransactions() {
  const transaction = db.transaction(["new_transaction"], "readwrite");
  const budjectObjectStore = transaction.objectStore("new_transaction");
  const getAll = budjectObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        header: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverReponse) => {
          if (serverReponse.message) {
            throw new Error(serverReponse);
          }

          const transaction = db.transaction(["new_transaction"], "readwrite");
          const budjectObjectStore = transaction.objectStore("new_transaction");

          budjectObjectStore.clear();

          alert("All transactions have been submitted!");
        })
        .catch((err) => {
          console.log(err.Error.message);
        });
    }
  };
}

window.addEventListener("online", uploadTransactions);
