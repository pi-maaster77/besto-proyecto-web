function toggleFriendsList() {
    const friendsList = document.getElementById("friends-list");
    if (friendsList.style.display === "none" || friendsList.style.display === "") {
        friendsList.style.display = "block"; 
    } else {
        friendsList.style.display = "none"; 
    }
}

window.onclick = function(event) {
    const friendsList = document.getElementById("friends-list");
    if (!event.target.matches('#toggle-friends-list') && !friendsList.contains(event.target)) {
        friendsList.style.display = "none"; 
    }
}