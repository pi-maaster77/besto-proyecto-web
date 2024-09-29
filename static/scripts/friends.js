const friendsList = document.getElementById("friends-list");
friendsList.style.display = "none"; 
function toggleFriendsList() {
    
    if (friendsList.style.display === "none" || friendsList.style.display === "") {
        friendsList.style.display = "block";
        document.body.style.overflow = 'hidden';
    } else {
        friendsList.style.display = "none"; 
        document.body.style.overflow = '';

    }
}

window.onclick = function(event) {

    if (!event.target.matches('#toggle-friends-list') && !friendsList.contains(event.target)) {
        friendsList.style.display = "none";
        document.body.style.overflow = '';
    }
}