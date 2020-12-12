import axios from "axios";
import { showAlert } from "./alert";

export const createCat = (name) => {
	const url = "http://127.0.0.1:6969/api/categories";
	axios({
		method: "POST",
		url,
		data: {
			name
		},
	})
		.then((res) => {
			if (res.data.status === "success") {
				showAlert("success", "Create successfully !");
				window.setTimeout(() => {
					location.assign("/admin/category");
				}, 1500);
			}
		})
		.catch((err) => {
			showAlert("error", err.response.data.message);
		});
};