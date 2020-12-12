import axios from "axios";
import { showAlert } from "./alert";

export const login = (email, password) => {
	const url = "http://127.0.0.1:6969/api/login";
	axios({
		method: "POST",
		url,
		data: {
			email,
			password,
		},
	})
		.then((res) => {
			if (res.data.status === "success") {
				showAlert("success", "Logged in successfully");
				window.setTimeout(() => {
					location.assign("/admin/product");
				}, 1500);
			}
		})
		.catch((err) => {
			showAlert("error", err.response.data.message);
		});
};

/* export const logout = async () => {
	try {
		const res = await axios({
			method: "GET",
			url: "http://127.0.0.1:6969/api/logout",
		});
		if (res.data.status === "success") {
			location.assign("/");
		}
	} catch (err) {
		showAlert("error", "Error loggin out! try again");
	}
};
 */
