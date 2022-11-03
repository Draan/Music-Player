var elem = document.documentElement; // for fullscreen
var music_playonce = false;


function loadCore() {

	// Create Ambience Player
	ambience_player = new Audio();
	ambience_player.loop = true;
	
	// Create Music Player
	music_player = new Audio(); 
	music_player.loop = false;
	music_player.addEventListener('ended', function() {
		music_player.currentTime = 0;
		if (music_playonce == true) {
			flipStopbutton();
			MusicStop();
		} else {
			$.each(list_music, function( k, list ) {
				if (music_player.id == list.name) {
					music_player.src = list.files[Math.floor(Math.random()*list.files.length)];
				}
			});
			music_player.load();
			var title = music_player.src;
			title = title.substr(title.lastIndexOf("/") + 1);
			title = title.substr(0, title.length - 4);
			document.getElementById('divPlayingMusic').innerHTML = "Playing "+title;
			SaveData("music", music_player.src);
			music_player.play();
		}
	}, false);	
	
	// Create Effects Player
		effects_player = new Audio(); 
		effects_player.loop = false;
		effects_player.addEventListener('ended', function() {
			EffectsStop();
		}, false);
		
	if (getCookie('musicVolume') == null) {
		createCookie();
	} else {
		document.getElementById('volumeEffects').value = getCookie('effectsVolume');
		document.getElementById('volumeAmbience').value = getCookie('ambientVolume');
		document.getElementById('volumeMusic').value = getCookie('musicVolume');
		music_player.volume = document.getElementById('volumeMusic').value;
		ambience_player.volume = document.getElementById('volumeAmbience').value;
		effects_player.volume = document.getElementById('volumeEffects').value;
	}	
	
		
	// Generate Music List
	$.each(list_music, function( k, list ) {
		var music_div = document.createElement('div');
		music_div.className = 'entry music';
		music_div.id = list.name;
		music_div.innerHTML = list.name
		music_div.onclick = function() { 
			MusicPlay(this.id);
		}
		document.getElementById('divMusic').appendChild(music_div);
	});
		
	// Make list of Ambience categories
	var categoryListAmb = [];
	$.each(list_ambience, function( k, list ) {
		if ( !categoryListAmb.includes(list.category) ) {
			categoryListAmb.push(list.category);
		}
	});
	categoryListAmb.sort(); // a cheap way to get important stuff first
	
	$.each(categoryListAmb, function( k, catNames ) {
		var category_div = document.createElement('div');
		category_div.className = 'category';
		if (catNames == "") {
			category_div.innerHTML = "Generic"; // another cheap solution to give this a name
		} else {
			category_div.innerHTML = catNames;
		}
		document.getElementById('divAmbience').appendChild(category_div);
		
		$.each(list_ambience, function( k, list ) { // add each sound to this cat
			if (list.category == catNames) {
				var ambience_div = document.createElement('div');
				ambience_div.className = 'entry ambience';
				ambience_div.id = list.file;
				ambience_div.innerHTML = list.name;
				ambience_div.onclick = function() { 
					AmbiencePlay(this.id);
				}
				document.getElementById('divAmbience').appendChild(ambience_div);
			}
		});
	});		
	
	// Make list of Effects categories
	var categoryListEffects = [];
	$.each(list_effects, function( k, list ) {
		if ( !categoryListEffects.includes(list.category) ) {
			categoryListEffects.push(list.category);
		}
	});
	
	$.each(categoryListEffects, function( k, catNames ) {
		var category_div = document.createElement('div');
		category_div.className = 'category';
		category_div.innerHTML = catNames;
		document.getElementById('divEffects').appendChild(category_div);
		
		$.each(list_effects, function( k, list ) { // add each sound to this cat
			if (list.category == catNames) {
				var effects_div = document.createElement('div');
				effects_div.className = 'entry effects';
				effects_div.innerHTML = list.name;
				effects_div.id = list.file;
				effects_div.onclick = function() { 
					EffectsPlay(this.id);
				}
				document.getElementById('divEffects').appendChild(effects_div);
			}
		});
	});
	
	//Hotkey functionality
	document.onkeydown = function(evt) {
		if (document.activeElement.id == 'searchText') {return;} // don't hotkey if we're searching
		evt = evt || window.event;
		
		$.each(list_hotkeys, function( k, list ) { //step through keys
			if (list.key == evt.key) {				// found proper key
				var items_music = document.getElementsByClassName("music");
				for (var i = 0; i < items_music.length; i++) { // check all music entries
					if (items_music[i].innerHTML == list.name) { // matches name
						MusicPlay(items_music[i].id); // play
						return;
					}
				} 
				
				var items_ambience = document.getElementsByClassName("ambience");				
				for (var i = 0; i < items_ambience.length; i++) { // check all ambience entries
					if (items_ambience[i].innerHTML == list.name) { // matches name
						AmbiencePlay(items_ambience[i].id); // play
						return;
					}
				} 
				
				var items_effects = document.getElementsByClassName("effects");				
				for (var i = 0; i < items_effects.length; i++) { // check all effect entries
					if (items_effects[i].innerHTML == list.name) { // matches name
						items_effects[i].player.currentTime = 0;
						items_effects[i].player.play(); // play
						return;
					}
				} 
				
				//Custom stuff (volume, skip, stop)
				
				if (list.name == "mSkip") {
					if (!music_player.paused) { music_player.currentTime = 500; }
				} else if (list.name == "mStop") {
					MusicStop();
				} else if (list.name == "aStop") {
					AmbienceStop();
				} else if (list.name == "eStop") {
					EffectsStop();
				}
				
				var music_volume = parseFloat(document.getElementById('volumeMusic').value);
				var ambience_volume = parseFloat(document.getElementById('volumeAmbience').value);
				var effects_volume = parseFloat(document.getElementById('volumeEffects').value);
				
				if (list.name == "mVolume Down") {
					music_volume -= 0.1;
				} else if (list.name == "mVolume Up") {
					music_volume += 0.1;
				} else if (list.name == "aVolume Down") {
					ambience_volume -= 0.1;
				} else if (list.name == "aVolume Up") {
					ambience_volume += 0.1;
				} else if (list.name == "eVolume Down") {
					effects_volume -= 0.1;
				} else if (list.name == "eVolume Up") {
					effects_volume += 0.1;
				}
				
				if (music_volume < 0) {music_volume = 0} // so inefficient.. 
				if (music_volume > 1) {music_volume = 1}
				if (ambience_volume < 0) {ambience_volume = 0}
				if (ambience_volume > 1) {ambience_volume = 1}
				if (effects_volume < 0) {effects_volume = 0}
				if (effects_volume > 1) {effects_volume = 1}
								
				music_player.volume = music_volume;
				ambience_player.volume = ambience_volume;
				EffectsVolume(effects_volume);
				
				document.getElementById('volumeMusic').value = music_volume;
				document.getElementById('volumeAmbience').value = ambience_volume;
				document.getElementById('volumeEffects').value = effects_volume;
			}
		});
	};	
}

function selectType(type) {
	switch (type) {
		case 'music':
		document.getElementById('menuMusic').className = 'active';
		document.getElementById('menuAmbience').className = '';
		document.getElementById('menuEffects').className = '';

		document.getElementById('divMusic').className = 'mainDiv';
		document.getElementById('divAmbience').className = 'mainDiv hidden';
		document.getElementById('divEffects').className = 'mainDiv hidden';
		
		document.getElementById('divMusic_volume').className = 'volume';
		document.getElementById('divAmbience_volume').className = 'volume hidden';
		document.getElementById('divEffects_volume').className = 'volume hidden';
		
		document.getElementById('divSearch').className = 'topnav search hidden';
		document.getElementById('divPlayingMusic').className = 'topnav playing';
		document.getElementById('divPlayingAtmos').className = 'topnav playing hidden';

		break
		case 'ambience':
		document.getElementById('menuMusic').className = '';
		document.getElementById('menuAmbience').className = 'active';
		document.getElementById('menuEffects').className = '';

		document.getElementById('divMusic').className = 'mainDiv hidden';
		document.getElementById('divAmbience').className = 'mainDiv';
		document.getElementById('divEffects').className = 'mainDiv hidden';
		
		document.getElementById('divMusic_volume').className = 'volume hidden';
		document.getElementById('divAmbience_volume').className = 'volume';
		document.getElementById('divEffects_volume').className = 'volume hidden';
		
		document.getElementById('divSearch').className = 'topnav search';
		document.getElementById('divPlayingMusic').className = 'topnav playing hidden';
		document.getElementById('divPlayingAtmos').className = 'topnav playing';
		break
		case 'effects':
		document.getElementById('menuMusic').className = '';
		document.getElementById('menuAmbience').className = '';
		document.getElementById('menuEffects').className = 'active';
		
		document.getElementById('divMusic').className = 'mainDiv hidden';
		document.getElementById('divAmbience').className = 'mainDiv hidden';
		document.getElementById('divEffects').className = 'mainDiv';
		
		document.getElementById('divMusic_volume').className = 'volume hidden';
		document.getElementById('divAmbience_volume').className = 'volume hidden';
		document.getElementById('divEffects_volume').className = 'volume';
		
		document.getElementById('divSearch').className = 'topnav search hidden';
		document.getElementById('divPlayingAtmos').className = 'topnav playing hidden';
		document.getElementById('divPlayingMusic').className = 'topnav playing hidden';
		break
	}	
}

function AmbiencePlay(src) {
	var tmp = document.getElementsByClassName("ambience");
	for (var i = 0; i < tmp.length; i++) {
		if (tmp[i].id == src) {
			tmp[i].style.background = '#78AB46';
			document.getElementById('divPlayingAtmos').innerHTML = 'Playing: '+tmp[i].innerHTML;
		} else {
			tmp[i].style.background = '';
		}
	} 
	ambience_player.id = src; // save file for later due to promise() not knowing
	
	if (ambience_player.paused) {
		ambience_player.volume = 0;
		ambience_player.src = src;
		ambience_player.load();
		SaveData("ambient", ambience_player.src);
		ambience_player.play();
		$(ambience_player).animate({volume: document.getElementById('volumeAmbience').value}, 4000);
	} else {		
		$(ambience_player).stop(true, true);
		$(ambience_player).animate({volume: 0}, 2000);
		$(ambience_player).promise().done(function() {
			ambience_player.src = ambience_player.id;
			ambience_player.load();
			SaveData("ambient", ambience_player.src);
			ambience_player.play();
			$(ambience_player).animate({volume: document.getElementById('volumeAmbience').value}, 2000);
		});
	}
}

function AmbienceStop() {
	var tmp = document.getElementsByClassName("ambience");
	for (var i = 0; i < tmp.length; i++) {
			tmp[i].style.background = '';
	} 
	$(ambience_player).stop(true, true);
	SaveData("ambient", "none");
	document.getElementById('divPlayingAtmos').innerHTML = 'Paused';
	$(ambience_player).animate({volume: 0}, 4000);
	$(ambience_player).promise().done(function() {
		ambience_player.pause();
	});
}

function MusicPlay(genre) {
	var tmp = document.getElementsByClassName("music"); // reset visual list
	for (var i = 0; i < tmp.length; i++) {
		if (tmp[i].id == genre) {
			tmp[i].style.background = '#78AB46';
		} else {
			tmp[i].style.background = '';
		}
	} 
	music_player.id = genre;
	
	if (music_player.paused) {
		music_player.volume = 0;
		$.each(list_music, function( k, list ) {
			if (genre == list.name) {
				list.files[Math.floor(Math.random()*list.files.length)];
				music_player.src = list.files[Math.floor(Math.random()*list.files.length)];
			}
		});
		music_player.load();
		var title = music_player.src;
		title = title.substr(title.lastIndexOf("/") + 1);
		title = title.substr(0, title.length - 4);
		document.getElementById('divPlayingMusic').innerHTML = "Playing "+title;
		SaveData("music", music_player.src);
		music_player.play();
		$(music_player).animate({volume: document.getElementById('volumeMusic').value}, 4000);
	} else {
		$(music_player).stop(true, true);
		$(music_player).animate({volume: 0}, 4000);
		$(music_player).promise().done(function() {
			$.each(list_music, function( k, list ) {
				if (music_player.id == list.name) {
					music_player.src = list.files[Math.floor(Math.random()*list.files.length)];
				}
			});
			music_player.load();
			var title = music_player.src;
			title = title.substr(title.lastIndexOf("/") + 1);
			title = title.substr(0, title.length - 4);
			document.getElementById('divPlayingMusic').innerHTML = "Playing "+title;
			SaveData("music", music_player.src);
			music_player.play();
			$(music_player).animate({volume: document.getElementById('volumeMusic').value}, 4000);
		});
	}
}

function MusicStop() {
	
	var tmp = document.getElementsByClassName("music");
	for (var i = 0; i < tmp.length; i++) {
			tmp[i].style.background = ''
	} 
	$(music_player).stop(true, true);
	document.getElementById('divPlayingMusic').innerHTML = "Paused";
	SaveData("music", "none");
	$(music_player).animate({volume: 0}, 4000);
	$(music_player).promise().done(function() {
		music_player.pause();
	});
}

function EffectsPlay(src) {
	var tmp = document.getElementsByClassName("effects");
	for (var i = 0; i < tmp.length; i++) {
		if (tmp[i].id == src) {
			tmp[i].style.background = '#78AB46';
		} else {
			tmp[i].style.background = '';
		}
	} 
	
	effects_player.src = src;
	effects_player.load();
	SaveData("effects", effects_player.src);
	effects_player.play();
}

function EffectsStop() {
	var tmp = document.getElementsByClassName("effects");
	for (var i = 0; i < tmp.length; i++) {
		tmp[i].style.background = '';
	} 
	effects_player.pause();
	SaveData("effects", "none");
}

function flipStopbutton() {
	music_playonce = !music_playonce;
	if (music_playonce == true) {
		document.getElementById('stop_soonbutton').style='filter: invert(100%);';
	} else {
		document.getElementById('stop_soonbutton').style='filter: invert(0%);';
	}
}

function OpenCheats() {
	window.open('cheats.html', '', 'width=400,height=600,toolbar=no,scrollbars=no');
}

function DoSearch() {
	var entrylist = [];
	var terms = document.getElementById('searchText').value.toLowerCase();
	
	$.each(list_ambience, function( k, list ) {
		if (list.name.toLowerCase().search(terms) > -1 || list.category.toLowerCase().search(terms) > -1 || list.tags.toLowerCase().search(terms) > -1) {
			entrylist.push(list.file);
		}	
	});

	var tmp = document.getElementsByClassName('ambience');
	$.each(tmp, function( k, list ) {
		list.className = 'entry ambience hidden';
		if (entrylist.indexOf(list.id) == -1 && terms != "") {
			list.style.display = 'none';
		} else {
			list.style.display = 'block';
		}
	});	
}

function SaveData(audiotype, audiofile) {
	
	$.ajax({
		url: "data.txt?"+(new Date()).getTime(),
		type: "GET",
		success: function(data) {
			if (audiotype == "music") {
				data.music_change = new Date().getTime();
				data.player_music = audiofile;
			}
			if (audiotype == "ambient") {
				data.ambient_change = new Date().getTime();
				data.player_ambient = audiofile;
			}
			if (audiotype == "effects") {
				data.effects_change = new Date().getTime();
				data.player_effects = audiofile;
			}
			
			var newdata = JSON.stringify(data);
			$.ajax({
				url: "update.php",
				type: "POST",
				data: {'a':newdata} // Stupid fucking object only posting ugh
			});
		},
		dataType: "json",
		timeout: 2000
	});
		

}


function checkFullscreen() {
	if (!window.screenTop && !window.screenY) {
		closeFullscreen();
	} else {
		openFullscreen();
	}
}

function openFullscreen() {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.webkitRequestFullscreen) { /* Safari */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE11 */
		elem.msRequestFullscreen();
	}
}

function closeFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) { /* Safari */
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) { /* IE11 */
		document.msExitFullscreen();
	}
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
}