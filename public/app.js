/*
 * http://plantuml.com/code-javascript-asynchronous
 */
$ = function(id){ return document.getElementById(id) };

function encode64(data) {
  let r = "";
  for (let i=0; i<data.length; i+=3) {
    if (i+2==data.length) {
      r +=append3bytes(data.charCodeAt(i), data.charCodeAt(i+1), 0);
    } else if (i+1==data.length) {
      r += append3bytes(data.charCodeAt(i), 0, 0);
    } else {
      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i+1),
        data.charCodeAt(i+2));
    }
  }
  return r;
}

function append3bytes(b1, b2, b3) {
  let c1 = b1 >> 2;
  let c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  let c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
  let c4 = b3 & 0x3F;
  let r = "";
  r += encode6bit(c1 & 0x3F);
  r += encode6bit(c2 & 0x3F);
  r += encode6bit(c3 & 0x3F);
  r += encode6bit(c4 & 0x3F);
  return r;
}

function encode6bit(b) {
  if (b < 10) {
    return String.fromCharCode(48 + b);
  }
  b -= 10;
  if (b < 26) {
    return String.fromCharCode(65 + b);
  }
  b -= 26;
  if (b < 26) {
    return String.fromCharCode(97 + b);
  }
  b -= 26;
  if (b == 0) {
    return '-';
  }
  if (b == 1) {
    return '_';
  }
  return '?';
}

/*
var deflater = window.SharedWorker && new SharedWorker('rawdeflate.js');
if (deflater) {
  deflater.port.addEventListener('message', done_deflating, false);
  deflater.port.start();
} else if (window.Worker) {
  deflater = new Worker('rawdeflate.js');
  deflater.onmessage = done_deflating;
}
*/

// function done_deflating(e) {
//   // $('im').src = "http://www.plantuml.com/plantuml/img/"+encode64(e.data);
//   console.log('done deflating');
// }

function compress (s) {
  // UTF8
  s = unescape(encodeURIComponent(s));
  // Sync. deflate() is defined in rawdeflate.js
  return deflate(s);
}

function encodeUML (s) {
  return encode64(compress(s));
}

/*
 * Firebase Configuration
 */

firebase.initializeApp({
  "apiKey": "AIzaSyBaIimM26onG155KrzgXPNORkKJM1iQiJE",
  "databaseURL": "https://powerplantuml.firebaseio.com",
  "storageBucket": "powerplantuml.appspot.com",
  "authDomain": "powerplantuml.firebaseapp.com",
  "messagingSenderId": "1001824758376",
  "projectId": "powerplantuml"
});

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

/*
 * Vuex Configuration
 */

const store = new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    image_url: "https://www.plantuml.com/plantuml/svg/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000",
    document: "@startuml\n@enduml",
    documents: {
      available: [],
      selected: 'TzwFK8y5MKJaXHHNO5go'
    }
  },
  mutations: {
    refreshImageUrl (state) {
      state.image_url = 'https://www.plantuml.com/plantuml/svg/'+encodeUML(state.document);
    },
    setSelectedDocumentId (state, document_id) {
      state.documents.selected = document_id;
    },
    setSelectedDocumentBody (state, body) {
      state.document = body;
      this.commit('refreshImageUrl');
    },
    setSelectedDocument (state, document) {
      state.document.body = document.body;
      state.document.name = document.name;
      this.commit('refreshImageUrl');
    }
  },
  actions: {
    saveDocument (context) {
      this.commit('refreshImageUrl');
      // Save to Firestore
      let docRef = db.collection('groups').doc('xexSn6rPC0StrI3uUZEY')
        .collection('repositories').doc('EqV2TFjWApYkF2DUQ1ZK')
        .collection('documents').doc('TzwFK8y5MKJaXHHNO5go');
      docRef.set({
        image_url: context.state.image_url,
        body: context.state.document
      }, { merge: true });
    },
    setSelectedDocument (context, id) {
      context.commit('setSelectedDocumentId', id);
      // Load content from Firestore
      context.dispatch('loadDocument', id);
    },
    loadDocument (context, document_id) {
      let docRef = db.collection('groups').doc('xexSn6rPC0StrI3uUZEY')
        .collection('repositories').doc('EqV2TFjWApYkF2DUQ1ZK')
        .collection('documents').doc(document_id);
      docRef.get().then(doc => {
        this.commit('setSelectedDocumentBody', doc.data().body);
        this.commit('refreshImageUrl');
      });
    },
    newDocument (context) {
      let document = {
        name: "New Document",
        body: "@startuml\n@enduml"
      };
      this.commit('setSelectedDocument', document);
      // Save to Firestore to get id
      let docCollectionRef = db.collection('groups').doc('xexSn6rPC0StrI3uUZEY')
        .collection('repositories').doc('EqV2TFjWApYkF2DUQ1ZK')
        .collection('documents');
      docCollectionRef.add(document).then(docRef => {
        context.commit('setSelectedDocumentId', docRef.id);
      });
    }
  }
});

var app = new Vue({
  el: '#app',
  store,
  data() {
    return {
      is_logged_in: false,
      login_email: "",
      login_password: ""
    }
  },
  computed: {
    selectedDocument: {
      get () {
        console.log('get', this.$store.state.documents.selected);
        return this.$store.state.documents.selected;
      },
      set (value) {
        console.log('set', value);
        this.$store.dispatch('setSelectedDocument', value);
      }
    }
  },
  methods: {
    // Watches keypresses inside the plantuml-editor
    keyWatcher (event) {
      // if (['Enter', 'ArrowUp', 'ArrowDown'].indexOf(event.key) >=0) {
      //   this.$store.dispatch('updateDocument', this.document);
      // }
    },
    saveDocument () {
      this.$store.dispatch('saveDocument');
    },
    newDocument () {
      this.$store.dispatch('newDocument');
    },
    logInGoogle() {
      // Sign in with Google authentication provider
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        this.is_logged_in = true
      })
      .catch((error) => {
        this.is_logged_in = false
        // Handle Errors here.
        var errorCode = error.code
        var errorMessage = error.message
        // The email of the user's account used.
        var email = error.email
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential
        if (errorCode === 'auth/account-exists-with-different-credential') {
          // TODO no alerts!
          alert('You have already signed up with a different auth provider for that email.')
          // If you are using multiple auth providers on your app you should handle linking
          // the user's accounts here.
        } else {
          console.error(error)
        }
      });
    },
    logInEmail () {
      // Sign in with Email provider
      firebase.auth().signInWithEmailAndPassword(this.login_email, this.login_password).then(result => {
          console.log(result);
        })
        .catch(error => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error(errorCode, errorMessage);
        });
    },
    logOut() {
      firebase.auth().signOut()
      // TODO clear all local user data
    }
  },
  mounted () {
    // Watch for hotkeys
    let vm = this;
    window.addEventListener('keydown', (event) => {
      if (event.key === 's' && event.getModifierState('Control')) {
        // User pressed ctrl+s somewhere in the window
        vm.saveDocument()
        event.preventDefault();
      }
    });
    // Watch Firebase authentication state
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.is_logged_in = true
      } else {
        // No user is signed in.
        this.is_logged_in = false
      }
    });
    // Load documents in this repository
    let docCollectionRef = db.collection('groups').doc('xexSn6rPC0StrI3uUZEY')
                             .collection('repositories').doc('EqV2TFjWApYkF2DUQ1ZK')
                             .collection('documents');
    docCollectionRef.get()
      .then(snapshot => {
        let docs = [];
        snapshot.forEach(doc => {
          docs.push({
            id: doc.id, 
            name: doc.data().name
          });
        });
        this.$store.state.documents.available = docs;
      });
  }
});