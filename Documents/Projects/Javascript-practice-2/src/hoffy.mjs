// hoffy.mjs
import {readFile} from 'fs';

const getEvenParam = (...args) => {
    return args.filter((arg, index) => index % 2 === 0);
};

function maybe(fn){
    return function(...args){
        if (args.some(arg => arg === null || arg === undefined)){
            return undefined;
        } else {
            return fn(...args);
        }
    };
}

function filterWith(fn){
    return function (arr){
        const arr1 = arr.filter(num => fn(num));
        return arr1;
    };
}

function repeatCall(fn, n, arg){
    if (n === 0){
        return undefined;
    } else {
        fn(arg);
        return repeatCall(fn, n-1, arg);
    }
}

function limitCallsDecorator(fn, n){
    let count = 0;
    return function(...args){
        if (count < n){
            count++;
            return fn(...args);
        } else {
            return undefined;
        }
    };
}

function myReadFile(fileName, successFn, errorFn){
    readFile(fileName, 'utf-8', (err, data) => {
        if (err) {
          errorFn(err);
        } else {
          successFn(data);
        }
      });
}

function rowsToObjects(data){//used recursion
    const headers = data.headers;
    const rows = data.rows;

    function convertRowToObject(rowIndex) {
        if (rowIndex >= rows.length) {
        return []; 
        }
        const row = rows[rowIndex];
        const obj = {};
        function assignValueToProperty(headerIndex) {
        if (headerIndex >= headers.length) {
            return obj;
        }
        const header = headers[headerIndex];
        obj[header] = row[headerIndex];
        return assignValueToProperty(headerIndex + 1);
        }
        return [assignValueToProperty(0)].concat(convertRowToObject(rowIndex + 1));
    }
    return convertRowToObject(0);
}
export {
    getEvenParam,
    maybe,
    filterWith,
    repeatCall,
    limitCallsDecorator,
    myReadFile,
    rowsToObjects
};