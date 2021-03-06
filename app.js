const MIX = "mixing";
const MAS = "mastering";
const ENG = "engineering";

let linkMap = new Map();
linkMap.set(MIX, []);
linkMap.set(MAS, []);
linkMap.set(ENG, []);

let discData = [];


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
  return a.order - b.order;
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

    retrieveFeatured();

    db.collection("links").get().then(function(querySnapshot) {

      document.querySelectorAll('.spinner').forEach(e => e.remove());

        querySnapshot.forEach(function(doc) {
            let data = doc.data();
            //linkMap.get(data.list).push([data.src, data.displayText, data.list, data.order, doc.id]);

            //linkMap.get(data.list).sort(sortLinks);
            discData.push(data);
            discData.sort(sortLinks);
        });
        onComplete();
    })
    .catch((error) => {
      console.log(error);
      //window.location.href = "adminauth.html";
    });
}

function displayData() {
    /*for (let key of linkMap.keys()) {
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
    }*/
    let listDom = document.getElementById("dlist");
    for (let i = 0; i < discData.length; i++) {
      var entry = document.createElement('li');
      entry.classList.add("discli");
      var linkNode = document.createElement('a');
      var roleNode = document.createElement('p');
      let data = discData[i];
      linkNode.href = data.src;
      linkNode.innerHTML = data.displayText;
      entry.appendChild(linkNode);
      roleNode.innerHTML = " - " + data.list;
      roleNode.classList.add("uk-text-italic");
      entry.appendChild(roleNode);
      listDom.appendChild(entry);
    }
}

function adminListData() {

    // redirect non-admins.
    if (firebase.auth().currentUser == null) {
      window.location.href = "index.html";
    }

    let listDom = document.getElementById("dlistadmin");
    for (let i = 0; i < discData.length; i++) {
        let entry = createCard(discData[i]);
        listDom.appendChild(entry);  
    }

    /*for (let key of linkMap.keys()) {
        let listDom = document.getElementById(key);
        let links = linkMap.get(key);
        for (let i = 0; i < links.length; i++) {
            let entry = createCard(links[i])
            listDom.appendChild(entry);
        }
    }*/
}

function retrieveFeatured() {
  const linksRef = db.collection("links");

  db.collection("featured").orderBy("order").get().then(function(q) {
    q.forEach(doc => {
      let data = doc.data();
      updateFtCardContent(data, linksRef);
    })
  });
}

async function updateFtCardContent(data, linksRef) {
  let mainDiv = document.getElementById("ft" + data.order);
  mainDiv.setAttribute("data-src", data.img_src);

  const linkSnapshot = await linksRef.where('uid', '==', data.link_id).get();
  let link;
  if (!linkSnapshot.empty) {
    linkSnapshot.forEach(doc => {
      link = doc.data();
    });
    console.log(link);
    let linkDiv = document.querySelector(`#ft${data.order} div`);
    linkDiv.setAttribute("href", link.src);

    let titleTag = document.querySelector(`#ft${data.order} div h1`);
    titleTag.innerHTML = link.displayText;

    let roleTag = document.querySelector(`#ft${data.order} div p`);
    roleTag.innerHTML = link.list;

  } else {
    console.log("ERROR");
  }

  
}

function createCard(linkdata) {
  var entry = document.createElement("div");
  entry.classList.add("uk-margin");
  var content = document.createElement("div");
  content.classList.add("uk-card", "uk-card-default", "uk-card-body", "uk-card-small");
  content.innerHTML = linkdata.displayText + "-- " + linkdata.src;
  entry.appendChild(content);

  entry.setAttribute("src", linkdata.src);
  entry.setAttribute("displayText", linkdata.displayText);
  entry.setAttribute("list", linkdata.list);
  entry.setAttribute("order", linkdata.order);
  entry.setAttribute("uid", linkdata.uid);

  console.log(linkdata);

  return entry;
}

function addItem() {
  let dtbox = document.getElementById("displaytext");
  let urlbox = document.getElementById("url");
  let rolebox = document.getElementById("role");
  let dt = dtbox.value;
  let url = urlbox.value;
  let role = rolebox.value;

  if (dt !== "" && url !== "") {
    let dobj = {
        src: url,
        displayText: dt,
        list: role,
        order: discData.length - 1,
        uid: dt + Date.now()
    }
    let card = createCard(dobj);
    document.getElementById("dlistadmin").appendChild(card);

    dtbox.value = "";
    urlbox.value = "";
  }

  
}

function fadeThemIn() {
  $(this).children('.ftInfo').eq(0).fadeTo(200, 0.98);
}
function fadeThemOut() {
  $(this).children('.ftInfo').eq(0).fadeOut(200);
} 

$(document).ready(function() {
  $(".uk-sortable").bind('DOMNodeInserted', listMoved);
  
  /*$(".uk-sortable").on("touchend", listMoved);
  $(".uk-sortable").on("mouseup mouseleave", listMoved);*/

  $(".ftInfo").hide();
  $(".ft").hover(fadeThemIn, fadeThemOut);

  $(".ft").on("touchstart, click", fadeThemIn);
  $(".ft").on("touchend", fadeThemOut);

  /*$(".ft").dblclick(function() {
      window.open($(this).children('.ftInfo').eq(0).attr("href"), "_blank");
  });*/

  // Double tap hack here.
  let dblClicked = false;
  $(".ft").on("click", function() {
      if (dblClicked) {
        window.open($(this).children('.ftInfo').eq(0).attr("href"), "_blank");
      }
      dblClicked = true;
      setTimeout(() => { dblClicked = false; }, 300);
  });

  $("#headerText").click(function() {
      UIkit.switcher(document.getElementById("nav")).show(0);
  });

  $("#lc").click(function() {
    window.open("https://lipcritic.bandcamp.com/", "_blank");
  });

  if ($(window).width() <= 670) {
    $(".ft").removeClass("uk-margin-medium-left");
    $(".firstInGrid").addClass("uk-width-medium uk-height-medium");
    $(".mobilenot").text("Double-Tap to Visit");
  } else {
    $(".mobilenot").text("Double-Click to Visit");
  }
});


function listMoved(e) {
  let listDomItems = e.currentTarget.children;
  
  for (let i = 0; i < listDomItems.length; i++) {
      //listDomItems[i].setAttribute("list", e.currentTarget.id);
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
    let listDom = document.getElementById("dlistadmin");
    let listDomItems = listDom.children;
       
        

        check.hide();
        spinner.show();

        for (let i = 0; i < listDomItems.length; i++) {
            
            let lis = listDomItems[i].getAttribute("list");
            let orde = listDomItems[i].getAttribute("order");
            let sr = listDomItems[i].getAttribute("src");
            let displaytex = listDomItems[i].getAttribute("displayText");
            let uuid = listDomItems[i].getAttribute("uid");
            
            let saveObj = {
              list: lis,
              order: orde,
              src: sr,
              displayText: displaytex,
              uid: uuid
            };
            console.log(saveObj);

            db.collection("links").doc(uuid).set(saveObj).then(function() {
              console.log("write success!");
              spinner.hide();
              check.show();
            }).catch((error) => {
              alert(error);
            });
        }
    

    check.hide();
    spinner.show();

    let listDomTc = document.getElementById("trashcan");
    let listDomItemsTc = listDomTc.children;

    for (let i = 0; i < listDomItemsTc.length; i++) {
        let uid = listDomItemsTc[i].getAttribute("uid");
        db.collection("links").doc(uid).delete().then(function() {
          console.log("write success!");
          spinner.hide();
          check.show();
          listDomTc.removeChild(listDomItemsTc[i]);
        }).catch((error) => {
          alert(error);
        });
    }
}

function logout() {
    firebase.auth().signOut().then(() => {
      window.location.href = "index.html";
    },
    (error) => {
      console.log("Failed to logout.");
    });
}