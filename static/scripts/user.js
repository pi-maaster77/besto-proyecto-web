window.addEventListener('beforeunload', function (e) {
    if (localStorage.getItem("save") == "false") {
        logout()
    }
});

const token = localStorage.getItem("token"); 
if(token){
    fetch(`/username?token=${token}`)
        .then(response => response.json())
        .then(username => document.getElementById("username").innerHTML = username.username
        );
}

function logout(){
    const tempToken = localStorage.getItem("token");
    localStorage.clear()
    const data = JSON.stringify({ 
        token: tempToken, 
        message: 'El usuario ha cerrado la pestaña' 
    });
    
    console.log('Enviando solicitud de logout:', data); // Agregar esta línea para depuración
    navigator.sendBeacon('/logout', data);
    location.reload();

}