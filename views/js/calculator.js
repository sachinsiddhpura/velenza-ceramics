
    let Wastage = (5/100);
    const lengthOfRoom = document.getElementById('lr').value;
    const breadthOfRoom = document.getElementById('br').value;

    let totalRoomArea = lengthOfRoom*breadthOfRoom;
    let perimeterOfRoom = 2*lengthOfRoom + 2*breadthOfRoom;

    const skirtingTileHeight = document.getElementById('sh').value;
    const skirtingTileArea = perimeterOfRoom*skirtingTileHeight
    
    const totalAreaLaid = totalRoomArea + skirtingTileArea;

    const tileBreadth = document.getElementById('tb').value;
    const tileWidth = document.getElementById('tw').value;

    const areaOfTile = tileBreadth*tileWidth;

    const result = (totalAreaLaid/areaOfTile)*Wastage;



// console.log(calculator());