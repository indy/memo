import { Component, Fragment, cloneElement, createContext, createElement, createRef, h, hydrate, isValidElement, options, render, toChildArray } from './preact.mjs';
import { useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue } from './hooks.mjs';
import { Router, Route, Link, route } from './preact-router.js';
import { Signal, batch, computed, effect, signal, useComputed, useSignal, useSignalEffect } from './signals.mjs';
import htm from './htm.mjs';

const html = htm.bind(h);

export {
    // preact
    Component,
    Fragment,
    cloneElement,
    createContext,
    createElement,
    createRef,
    h,
    hydrate,
    isValidElement,
    options,
    render,
    toChildArray,

    // hooks
    useCallback,
    useContext,
    useDebugValue,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState,

    // preact-router
    Link,
    Route,
    Router,
    route,

    // signals
    Signal,
    batch,
    computed,
    effect,
    signal,
    useComputed,
    useSignal,
    useSignalEffect,

    html
};
