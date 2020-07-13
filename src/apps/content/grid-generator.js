
export default function (ctx, gridColor, gridSpacing) {
    ctx.strokeStyle = gridColor;
    const w = ctx.canvas.width,
        h = ctx.canvas.height;
    ctx.beginPath();
    for (let x=gridSpacing/2; x<=w; x+=gridSpacing){
        ctx.save();
        ctx.translate(0.5, 0);
        ctx.moveTo(x-0.5,0);      // 0.5 offset so that 1px lines are crisp
        ctx.lineTo(x-0.5,h);
        ctx.restore();
    }
    for (let y=gridSpacing/2;y<=h;y+=gridSpacing){
        ctx.save();
        ctx.translate(0, 0.5);
        ctx.moveTo(0,y-0.5);
        ctx.lineTo(w,y-0.5);
        ctx.restore();
    }
    ctx.stroke();
}
