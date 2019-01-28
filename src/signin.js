function getSignInTokenFromURL(search) {
    const token = search.slice("?token=".length);
    localStorage.setItem("signInToken", token);
}

try {
    getSignInTokenFromURL(window.location.search);
    window.location.href = "./index.html";
} catch (e) {
    window.location.href = "./index.html";
}
