import axios from "axios";
import { showAlert } from "./alert";

export const createPro = (name, category, price, color) => {
	const url = "http://127.0.0.1:6969/api/products";
	axios({
		method: "POST",
		url,
		data: {
			name,
			category,
			price,
			color,
		},
	})
		.then((res) => {
			if (res.data.status === "success") {
				showAlert("success", "Create successfully !");
				window.setTimeout(() => {
					location.assign("/admin/product");
				}, 1500);
			}
		})
		.catch((err) => {
			showAlert("error", err.response.data.message);
		});
};
