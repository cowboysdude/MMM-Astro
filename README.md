# MMM-Astro
Astrology Module for MagicMirror2

Formly MMM-Astrology 

Meet MMM-Astro with more info!

## 4 different icon sets to choose from!
![](examples/1.PNG) 
![](examples/2.PNG) 
![](examples/3.PNG) 
![](examples/4.PNG) 

## Installation
     ~MagicMirror/modules
     `git clone https://github.com/cowboysdude/MMM-Astro.git`
      cd
      ~MagicMirror/modules/MMM-Astro
      run - npm install
      
 ## Configuration options

The following properties can be configured:

| Option | Description
| --- | ---
| `sign` | The star sign to display. Must be lower case. <br><br> **Example values:** `leo`, `aries`, `pisces`<br>**Default value:** none
| `iconSet` | The type of horoscope icon to display. <br><br> **Possible values:** `1`, `2`, `3`, `4`<br>**Default value: 1**  <br> 
|`extend`| to show the extended forecast  <br><br> **Possible values:** `true`, `false` <br>**Default value: true** 
 
 
 
 ## Add to Config.js
  
           {
            disabled: false,
            module: 'MMM-Astro',
            position: 'top_right',
			      config: {
			      sign: "pisces",
			      iconset: "1",
			      extend: true 
			             }
           },
          
