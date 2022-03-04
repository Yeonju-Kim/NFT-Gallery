import React, {useEffect, useState}from "react";
import KaikasPage from "./pages/KaikasPage";
import './App.css';
import Unity, { UnityContext } from "react-unity-webgl";

const unityContext = new UnityContext({
  loaderUrl: "build/webgl.loader.js",
  dataUrl: "build/webgl.data",
  frameworkUrl: "build/webgl.framework.js",
  codeUrl: "build/webgl.wasm",
});

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(function () {
    unityContext.on("loaded", function () {
      setIsLoaded(true);
    });
  }, []);

  function handleClick(e) {
    unityContext.setFullscreen(true);
  }

  return (
    <div id= "unity" className="wrapper" > 
      <h1>NFT Gallery </h1>
      <p> This Unity game shows 5 NFTs owned by your KAIKAS wallet account.</p>
      <div className="unity-footer">
        <div className="unity-webgl-logo"></div>
        <button className="unity-fullscreen-button" onClick={handleClick}></button>
      </div>
      <Unity style={{
          height: "100%",
          width: "60%",
          border: "2px solid black",
          background: "grey",
      }} unityContext={unityContext} />
      <KaikasPage unityLoaded={isLoaded} unityContext={unityContext}/>
    </div>
  ) 
}

export default App;
