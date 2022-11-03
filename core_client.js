var ambient_oldtime = 0; // new Date().getTime();
var effects_oldtime = 0; // set to 0 so that whatever was played last will start playing again. For late comers.
var music_oldtime = 0;

var mutedChrome = true;


function loadCore() {
	
	// Create Ambience Player
	ambience_player = new Audio();
	ambience_player.volume = document.getElementById('volumeAmbience').value;
	ambience_player.loop = true;

	// Create Music Player
	music_player = new Audio(); 
	music_player.volume = document.getElementById('volumeMusic').value;
	music_player.loop = false;
	music_player.addEventListener('ended', function() {
		document.getElementById('divPlayingMusic').innerHTML = "Music: Waiting for signal..";
	}, false);	

	// Generate Effect Players
	effects_player = new Audio(); 
	effects_player.volume = document.getElementById('volumeEffects').value;
	effects_player.loop = false;
	effects_player.addEventListener('ended', function() {
		document.getElementById('divPlayingEffect').innerHTML = "Effect: Waiting for signal..";
	}, false);

	if (getCookie('musicVolume') == null) {
		createCookie();
	} else {
		document.getElementById('volumeMaster').value = getCookie('masterVolume');
		document.getElementById('volumeEffects').value = getCookie('effectsVolume');
		document.getElementById('volumeAmbience').value = getCookie('ambientVolume');
		document.getElementById('volumeMusic').value = getCookie('musicVolume');
		masterVolume(getCookie('masterVolume'));
	}

	if (mutedChrome) { // now required on all platforms :(
		document.getElementById('ChromePlay').style = "display; block;";
	}

}

function pollSite() {
    setTimeout(function() {
        $.ajax({
            url: "data.txt?"+new Date().getTime(),
            type: "GET",
            success: function(data) {
				if (data.ambient_change > ambient_oldtime) { // fresh data!
					ambient_oldtime = data.ambient_change;
					if (data.player_ambient != "none") {
						ambience_player.src = data.player_ambient; // setting volume is only for fadeout
						ambience_player.volume = document.getElementById('volumeMaster').value * document.getElementById('volumeAmbience').value; 
						document.getElementById('divPlayingAtmos').innerHTML = "Atmosphere: Playing";
						ambience_player.play();
					} else {
						AmbienceStop();
					}
				}
				if (data.music_change > music_oldtime) { // fresh data!
					music_oldtime = data.music_change;
					if (data.player_music != "none") {
						music_player.src = data.player_music;
						document.getElementById('divPlayingMusic').innerHTML = "Music: Playing";
						music_player.volume = document.getElementById('volumeMaster').value * document.getElementById('volumeMusic').value;
						music_player.play();
					} else {
						MusicStop();
					}
				}
				if (data.effects_change > effects_oldtime) { // fresh data!
					effects_oldtime = data.effects_change;
					if (data.player_effects != "none") {
						effects_player.src = data.player_effects;
						document.getElementById('divPlayingEffect').innerHTML = "Effect: Playing";
						effects_player.play();
					} else {
						EffectsStop();
					}
				}	
            },
            dataType: "json",
            complete: pollSite,
            timeout: 1000
        })
    }, 1000);
};

function AmbienceStop() {

	$(ambience_player).animate({volume: 0}, 4000);
	$(ambience_player).promise().done(function() {
		ambience_player.pause();
		document.getElementById('divPlayingAtmos').innerHTML = 'Atmosphere: Waiting for signal..';
	});
}

function MusicStop() {
	
	$(music_player).animate({volume: 0}, 4000);
	$(music_player).promise().done(function() {
		music_player.pause();
		document.getElementById('divPlayingMusic').innerHTML = "Music: Waiting for signal..";
	});
}

function EffectsStop() {
	effects_player.pause();
	document.getElementById('divPlayingEffect').innerHTML = "Effect: Waiting for signal..";
}

function PlayAndHide() {
	document.getElementById('ChromePlay').style = "display: none;";
	pollSite();
}

function masterVolume(volume) {	
	ambience_player.volume = document.getElementById('volumeMaster').value * document.getElementById('volumeAmbience').value;
	music_player.volume = document.getElementById('volumeMaster').value * document.getElementById('volumeMusic').value;
	effects_player.volume = document.getElementById('volumeMaster').value * document.getElementById('volumeEffects').value;
}

function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
} 

function createCookie() {	
	var now = new Date();
	now.setMonth( now.getMonth() + 1 );
	document.cookie = "musicVolume=" + document.getElementById('volumeMusic').value + "; SameSite=Strict; path=/; expires=" + now.toUTCString() + ";";
	document.cookie = "ambientVolume=" + document.getElementById('volumeAmbience').value + "; SameSite=Strict; path=/; expires=" + now.toUTCString() + ";";
	document.cookie = "effectsVolume=" + document.getElementById('volumeEffects').value + "; SameSite=Strict; path=/; expires=" + now.toUTCString() + ";";
	document.cookie = "masterVolume=" + document.getElementById('volumeMaster').value + "; SameSite=Strict; path=/; expires=" + now.toUTCString() + ";";
}