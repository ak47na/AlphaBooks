/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * FirebaseUI initialization to be used in a Single Page application context.
 */

/**
 * @return {!Object} The FirebaseUI config.
 */
function getUiConfig() {
  return {
    callbacks: {
      // Called when the user has been successfully signed in.
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        if (authResult.user) {
          handleSignedInUser(authResult.user);
        }
        if (authResult.additionalUserInfo) {
          document.getElementById('is-new-user').textContent = authResult.additionalUserInfo.isNewUser
            ? 'New User'
            : 'Existing User';
        }

        return true;
      },
    },
    // Opens IDP Providers sign-in flow in a popup.
    signInFlow: 'popup',
    signInSuccessUrl: '/loggedIn.html',
    signInOptions: [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // Required to enable ID token credentials for this provider.
        clientId: CLIENT_ID,
      },
    ],
    // Terms of service url.
    tosUrl: 'https://www.google.com',
    // Privacy policy url.
    privacyPolicyUrl: 'https://www.google.com',
    credentialHelper: CLIENT_ID && CLIENT_ID != 'YOUR_OAUTH_CLIENT_ID'
      ? firebaseui.auth.CredentialHelper.GOOGLE_YOLO
      : firebaseui.auth.CredentialHelper.NONE,
  };
}

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Disable auto-sign in.
ui.disableAutoSignIn();

/**
 * Redirects to the FirebaseUI widget.
 */
var signInWithRedirect = function() {
  window.location.assign(getWidgetUrl());
};

/**
 * Open a popup with the FirebaseUI widget.
 */
var signInWithPopup = function() {
  window.open(getWidgetUrl(), 'Sign In', 'width=985,height=735');
};

/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function(user) {
  if (window.location.pathname !== '/loggedIn.html') {
    window.location.pathname = '/loggedIn.html';
  }
  if (document.getElementById('user-signed-in')) {
    document.getElementById('user-signed-in').style.display = 'block';
    document.getElementById('name').textContent = user.displayName;
    document.getElementById('email').textContent = user.email;
    document.getElementById('phone').textContent = user.phoneNumber;
    if (user.photoURL) {
      var photoURL = user.photoURL;
      // Append size to the photo URL for Google hosted images to avoid requesting
      // the image with its original resolution (using more bandwidth than needed)
      // when it is going to be presented in smaller size.
      if (photoURL.indexOf('googleusercontent.com') != -1 || photoURL.indexOf('ggpht.com') != -1) {
        photoURL = photoURL + '?sz=' + document.getElementById('photo').clientHeight;
      }
      document.getElementById('photo').src = photoURL;
      document.getElementById('photo').style.display = 'block';
    } else {
      document.getElementById('photo').style.display = 'none';
    }
  }
  if (document.getElementById('user-signed-out')) {
    document.getElementById('user-signed-out').style.display = 'none';
  }
};

/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
  if (window.location.pathname !== '/index.html') {
    window.location.pathname = '/index.html';
  }
  if (document.getElementById('user-signed-in')) {
    document.getElementById('user-signed-in').style.display = 'none';
  }
  if (document.getElementById('user-signed-out')) {
    document.getElementById('user-signed-out').style.display = 'block';
  }
  ui.start('#firebaseui-container', getUiConfig());
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('loaded').style.display = 'block';
  user ? handleSignedInUser(user) : handleSignedOutUser();
});

/**
 * Deletes the user's account.
 */
var deleteAccount = function() {
  firebase.auth().currentUser.delete().catch(function(error) {
    if (error.code == 'auth/requires-recent-login') {
      // The user's credential is too old. She needs to sign in again.
      firebase.auth().signOut().then(function() {
        // The timeout allows the message to be displayed after the UI has
        // changed to the signed out state.
        setTimeout(
          function() {
            alert('Please sign in again to delete your account.');
          },
          1
        );
      });
    }
  });
};

/**
 * Initializes the app.
 */
var initApp = function() {
  if (document.getElementById('sign-out')) {
    document.getElementById('sign-out').addEventListener('click', function() {
      firebase.auth().signOut();
      // Redirect to log in page.
      window.location.href = 'index.html';
    });
  }
  if (document.getElementById('delete-account')) {
    document.getElementById('delete-account').addEventListener('click', function() {
      deleteAccount();
      // Redirect to log in page.
      window.location.href = 'index.html';
    });
  }
};

window.addEventListener('load', initApp);
