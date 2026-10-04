const API_BASE_URL = "http://127.0.0.1:8000";

async function getOrders() {
    const response = await fetch(
        `${API_BASE_URL}/api/orders/`
    );

    if (!response.ok) {
        throw new Error("Failed to load orders");
    }

    return await response.json();
}


async function getOrder(orderId) {
    const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}`
    );

    if (!response.ok) {
        throw new Error("Failed to load order");
    }

    return await response.json();
}


async function deleteOrder(orderId) {
    const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete order");
    }

    return await response.json();
}


async function createOrder(orderData) {
    const response = await fetch(
        `${API_BASE_URL}/api/orders/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    return await response.json();
}