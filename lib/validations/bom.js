export const validateBomEntry = (data, items) => {
  const errors = [];

  // Find item and component details
  const item = items.find((i) => i.id === parseInt(data.item_id));
  const component = items.find(
    (i) => i.id === parseInt(data.component_id)
  );

  if (!item || !component) {
    errors.push("Invalid item or component selection");
    return errors;
  }

  // Validate based on item type
  switch (item.type) {
    case "sell":
      if (!data.item_id) {
        errors.push(
          "Sell items must have at least one entry as item_id"
        );
      }
      break;
    case "purchase":
      if (!data.component_id) {
        errors.push(
          "Purchase items must have at least one entry as component_id"
        );
      }
      break;
    case "component":
      if (!data.item_id || !data.component_id) {
        errors.push(
          "Component items must have both item_id and component_id entries"
        );
      }
      break;
  }

  // UoM-based quantity validation
  if (item.uom === "Nos" && component.uom === "Nos") {
    if (!Number.isInteger(Number(data.quantity))) {
      errors.push(
        "Quantity must be a whole number when both items use Nos"
      );
    }
  }

  // Additional quantity validations
  if (parseFloat(data.quantity) <= 0) {
    errors.push("Quantity must be greater than 0");
  }

  return errors;
};
