/** @type {import('jest').Config} */
module.exports = {
	preset: 'jest-expo',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	transformIgnorePatterns: [
		'node_modules/(?!((jest-)?react-native|@react-native|react-clone-referenced-element|expo(modules)?|@expo|expo-.*|@expo/.*|@react-navigation/.*|@tanstack/.*))',
	],
};


