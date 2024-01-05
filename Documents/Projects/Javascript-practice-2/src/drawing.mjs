// drawing.js
import {writeFile} from 'fs';
class GenericElement {
    constructor(name){
        this.name = name;
        this.attributes = {};
        this.children = [];
        this.content = '';
    }
    addAttrs(obj){
        Object.entries(obj).map(([key, value]) => {
            this.attributes[key] = value;
        });
    }
    removeAttrs(arr){
        this.attributes = Object.entries(this.attributes).filter(([key]) => !arr.includes(key)).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    }
    addAttr(name, value){
        this.attributes[name] = value;
    }
    setAttr(name, value){
        this.attributes[name] = value;
    }
    toString(){
        const attributesStr = Object.entries(this.attributes).map(([key, value]) => `${key}="${value}"`).join(' ');
        const childrenStr = this.children.map(child => child.toString()).join('\n');
        if (childrenStr) {
            return `<${this.name} ${attributesStr}>\n${childrenStr}\n</${this.name}>`;
        } else {
            return `<${this.name} ${attributesStr}>${this.content}</${this.name}>`;
        }
}
}

class RootElement extends GenericElement {
    constructor(){
        super();
        this.name = "svg";
        this.children = [];
        this.attributes = {
            xmlns: "http://www.w3.org/2000/svg",
        };
    }
    addChild(child){
        this.children.push(child);
    }
    write(fileName, cb){
        const svgString = this.toString();

        writeFile(fileName, svgString, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log(`SVG markup written to ${fileName}`);
            if (cb && typeof cb === 'function') {
            cb(); 
            }
        }
        });
    }
}


class RectangleElement extends GenericElement {
    constructor(x, y, width, height, fill){
        super();
        this.name = "rect";
        this.attributes = {
            x : x,
            y : y,
            width : width,
            height : height,
            fill : fill,
        };
        this.children = [];
    }
}

class TextElement extends GenericElement{
    constructor(x, y, fontSize, fill, content){
        super();
        this.name = "text";
        this.attributes = {
            x : x,
            y : y,
            fontSize : fontSize,
            fill : fill,
        };
        this.children = [];
        this.content = content;
    }
}

// the following is used for testing
// create root element with fixed width and height
const root = new RootElement();
root.addAttrs({width: 800, height: 170, abc: 200, def: 400});
root.removeAttrs(['abc','def', 'non-existent-attribute']);

// create circle, manually adding attributes, then add to root element
const c = new GenericElement('circle');
c.addAttr('r', 75);
c.addAttr('fill', 'yellow');
c.addAttrs({'cx': 200, 'cy': 80});
root.addChild(c);

// create rectangle, add to root svg element
const r = new RectangleElement(0, 0, 200, 100, 'blue');
root.addChild(r);

// create text, add to root svg element
const t = new TextElement(50, 70, 70, 'red', 'wat is a prototype? 😬');
root.addChild(t);

// show string version, starting at root element
console.log(root.toString());

// write string version to file, starting at root element
root.write('test.svg', () => console.log('done writing!'));