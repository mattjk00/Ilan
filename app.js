const MIX = "mixing";
const MAS = "mastering";
const ENG = "engineering";

let linkMap = new Map();
linkMap.set(MIX, []);
linkMap.set(MAS, []);
linkMap.set(ENG, []);


var firebaseConfig = {
    apiKey: "AIzaSyAZVS4VPzvlkpopkhJrie1Onk7-RNe4mZs",
    authDomain: "ilan-bc1b3.firebaseapp.com",
    projectId: "ilan-bc1b3",
    storageBucket: "ilan-bc1b3.appspot.com",
    messagingSenderId: "715467029812",
    appId: "1:715467029812:web:319a4b5762c6c742457961"
};
  
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

function sortLinks(a, b) {
  console.log(a, b);
  return parseInt(a[3]) - parseInt(b[3]);
}

function submitLoginForm() {
    console.log("starting...");
    let username = document.getElementById("username").value;
    let pword = document.getElementById("password").value;

    let spinner = document.getElementById("spinner");
    spinner.style.display = "block";
    

    let notif = document.getElementById("notif");
    notif.style.display = "none";

    firebase.auth().signInWithEmailAndPassword(username, pword)
    .then((user) => {
        window.location.href = "admin.html";
        spinner.style.display = "none";
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      spinner.style.display = "none";
      notif.style.display = "block";
    });
}

/**/

function getData(onComplete) {
    db.collection("links").get().then(function(querySnapshot) {

      document.querySelectorAll('.spinner').forEach(e => e.remove());

        querySnapshot.forEach(function(doc) {
            let data = doc.data();
            linkMap.get(data.list).push([data.src, data.displayText, data.list, data.order, doc.id]);

            linkMap.get(data.list).sort(sortLinks);
        });
        onComplete();
    })
    .catch((error) => {
      console.log(error);
      //window.location.href = "adminauth.html";
    });
}

function displayData() {
    for (let key of linkMap.keys()) {
        let listDom = document.getElementById(key);
        let links = linkMap.get(key);
        for (let i = 0; i < links.length; i++) {
            var entry = document.createElement('li');
            var linkNode = document.createElement('a');
            linkNode.href = links[i][0];
            linkNode.innerHTML = links[i][1];
            entry.appendChild(linkNode);
            listDom.appendChild(entry);
        }
    }
}

function adminListData() {
    for (let key of linkMap.keys()) {
        let listDom = document.getElementById(key);
        let links = linkMap.get(key);
        for (let i = 0; i < links.length; i++) {
            let entry = createCard(links[i])
            listDom.appendChild(entry);
        }
    }
}

function createCard(linkdata) {
  var entry = document.createElement("div");
  entry.classList.add("uk-margin");
  var content = document.createElement("div");
  content.classList.add("uk-card", "uk-card-default", "uk-card-body", "uk-card-small");
  content.innerHTML = linkdata[1] + "-- " + linkdata[0];
  entry.appendChild(content);

  entry.setAttribute("src", linkdata[1]);
  entry.setAttribute("displayText", linkdata[0]);
  entry.setAttribute("list", linkdata[2]);
  entry.setAttribute("order", linkdata[3]);
  entry.setAttribute("uid", linkdata[4]);

  return entry;
}

function addItem() {
  let dtbox = document.getElementById("displaytext");
  let urlbox = document.getElementById("url");
  let dt = dtbox.value;
  let url = urlbox.value;

  if (dt !== "" && url !== "") {
    let card = createCard([dt, url, MIX, 0, dt + Date.now()]);
    document.getElementById(MIX).appendChild(card);

    dtbox.value = "";
    urlbox.value = "";
  }

  
}

$(document).ready(function() {
  $(".uk-sortable").bind('DOMNodeInserted', function() {
    console.log('node inserted');
  });
  
  $(".uk-sortable").on("touchend", listMoved);
  $(".uk-sortable").on("mouseup mouseleave", listMoved);
});


function listMoved(e) {
  let listDomItems = e.currentTarget.children;
  
  for (let i = 0; i < listDomItems.length; i++) {
      listDomItems[i].setAttribute("list", e.currentTarget.id);
      listDomItems[i].setAttribute("order", i);
  }
}

let spinner;
let check;
function prepareAdminPage() {
  spinner = $("#adminspinner");
  spinner.hide();

  check = $("#admincheck");
  check.hide();
}



function saveEdits() {
    for (let key of linkMap.keys()) {
        let listDom = document.getElementById(key);
        let listDomItems = listDom.children;

        check.hide();
        spinner.show();

        for (let i = 0; i < listDomItems.length; i++) {
            
            let lis = listDomItems[i].getAttribute("list");
            let orde = listDomItems[i].getAttribute("order");
            let sr = listDomItems[i].getAttribute("src");
            let displaytex = listDomItems[i].getAttribute("displayText");
            let uid = listDomItems[i].getAttribute("uid");
            
            db.collection("links").doc(uid).set({
              list: lis,
              order: orde,
              src: sr,
              displayText: displaytex
            }).then(function() {
              console.log("write success!");
              spinner.hide();
              check.show();
            }).catch((error) => {
              alert(error);
            });
        }
    }

    check.hide();
    spinner.show();

    let listDom = document.getElementById("trashcan");
    let listDomItems = listDom.children;

    for (let i = 0; i < listDomItems.length; i++) {
        let uid = listDomItems[i].getAttribute("uid");
        db.collection("links").doc(uid).delete().then(function() {
          console.log("write success!");
          spinner.hide();
          check.show();
          listDom.removeChild(listDomItems[i]);
        }).catch((error) => {
          alert(error);
        });
    }
}