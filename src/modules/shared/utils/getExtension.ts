export function getExtension(filename) {
	let i = filename.lastIndexOf(".");
	return i < 0 ? "" : filename.substr(i);
}
