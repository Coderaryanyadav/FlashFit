import '@testing-library/jest-dom'

// Polyfill fetch for Firebase
global.fetch = jest.fn()
global.Request = jest.fn()
global.Response = jest.fn()
global.Headers = jest.fn()
