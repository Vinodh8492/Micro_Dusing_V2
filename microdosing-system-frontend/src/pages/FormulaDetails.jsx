import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Button,
  Typography,
  Box,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UpdateIcon from '@mui/icons-material/Update';

const FormulaDetails = () => {
  const [recipes, setRecipes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState({});
  const [setPoints, setSetPoints] = useState({});
  const [actualValues, setActualValues] = useState({});
  const [margins, setMargins] = useState({});
  const [formulaCreatedMap, setFormulaCreatedMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recipeMaterialStatus, setRecipeMaterialStatus] = useState({});
  const [selectedStorage, setSelectedStorage] = useState({});
  const [recipeMaterials, setRecipeMaterials ] = useState({})

  const navigate = useNavigate();

  const FORMULA_ORDER_KEY = "formula-dosing-order";

  const saveFormulaDosingOrderToLocalStorage = (recipeList) => {
    const ids = recipeList.map((r) => r.recipe_id);
    localStorage.setItem(FORMULA_ORDER_KEY, JSON.stringify(ids));
  };

  const reorderRecipesFromLocalStorage = (originalList) => {
    const storedOrder = JSON.parse(localStorage.getItem(FORMULA_ORDER_KEY));
    if (!storedOrder) return originalList;
    const reordered = storedOrder
      .map((id) => originalList.find((r) => r.recipe_id === id))
      .filter(Boolean);
    const newOnes = originalList.filter(
      (r) => !storedOrder.includes(r.recipe_id)
    );
    return [...reordered, ...newOnes];
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/recipes");
        const recipesData = response.data;
        const reordered = reorderRecipesFromLocalStorage(recipesData);
        setRecipes(reordered);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
  
    const fetchMaterials = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/materials");
        console.log("response :", response);
        setMaterials(response.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };
  
    const fetchRecipeMaterials = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/recipe_materials");
        console.log("recipe materials response:", response);
        setRecipeMaterials(response.data);  // Set the recipe materials data in state
      } catch (error) {
        console.error("Error fetching recipe materials:", error);
      }
    };
  
    fetchRecipes();
    fetchMaterials();
    fetchRecipeMaterials();  // Fetch recipe materials here
  }, []);
  

  console.log("recipes :", recipes)

  const handleMaterialChange = (recipeId, event) => {
    setSelectedMaterials((prev) => ({
      ...prev,
      [recipeId]: event.target.value,
    }));
  };

  const handleSetPointChange = (recipeId, value) => {
    setSetPoints((prev) => ({
      ...prev,
      [recipeId]: value,
    }));
  };

  const handleActualChange = (recipeId, value) => {
    setActualValues((prev) => ({
      ...prev,
      [recipeId]: value,
    }));
  };

  const handleMarginChange = (recipeId, value) => {
    setMargins((prev) => ({
      ...prev,
      [recipeId]: value,
    }));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newRecipes = [...recipes];
    [newRecipes[index - 1], newRecipes[index]] = [
      newRecipes[index],
      newRecipes[index - 1],
    ];
    setRecipes(newRecipes);
    saveFormulaDosingOrderToLocalStorage(newRecipes);
    if (currentIndex === index) setCurrentIndex(index - 1);
  };

  const handleMoveDown = (index) => {
    if (index === recipes.length - 1) return;
    const newRecipes = [...recipes];
    [newRecipes[index + 1], newRecipes[index]] = [
      newRecipes[index],
      newRecipes[index + 1],
    ];
    setRecipes(newRecipes);
    saveFormulaDosingOrderToLocalStorage(newRecipes);
    if (currentIndex === index) setCurrentIndex(index + 1);
  };

  const handleEdit = (recipeId) => {
    console.log(`Editing recipe: ${recipeId}`);
  };

  const handleDelete = async (recipeId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:5000/api/recipe_materials/${recipeId}`
      );
      alert("❌ Deleted recipe material");
      setFormulaCreatedMap((prev) => ({
        ...prev,
        [recipeId]: false,
      }));
    } catch (error) {
      console.error("Error deleting recipe material:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
  
    try {
      // Iterate through each selected material and send POST request
      const postPromises = Object.keys(selectedMaterials).map(async (recipeMaterialId) => {
        const materialName = selectedMaterials[recipeMaterialId];
        const setPoint = setPoints[recipeMaterialId];
  
        // Ensure that materialName and setPoint exist before proceeding
        if (!materialName || !setPoint) {
          alert(`Missing values for material with ID: ${recipeMaterialId}`);
          return;
        }
  
        const selectedMaterial = materials.find((m) => m.title === materialName);
        if (!selectedMaterial) {
          alert(`Material not found for ID: ${recipeMaterialId}`);
          return;
        }
  
        // Convert recipeMaterialId and material_id to integers
        const recipeMaterialIdInt = parseInt(recipeMaterialId, 10);
        const materialIdInt = parseInt(selectedMaterial.material_id, 10);
  
        if (isNaN(recipeMaterialIdInt) || isNaN(materialIdInt)) {
          alert(`Invalid integer value for recipe_id or material_id`);
          return;
        }
  
        // Check if the recipe already exists
        const checkResponse = await axios.get(
          `http://127.0.0.1:5000/api/recipe_materials/${recipeMaterialIdInt}`
        );
  
        // If the recipe exists, we will update it
        const payload = {
          recipe_id: recipeMaterialIdInt,  // Convert recipeMaterialId to integer
          material_id: materialIdInt,      // Convert material_id to integer
          set_point: parseFloat(setPoint),
          actual: 0,  // Set the actual value as needed (use 0 or adjust based on your needs)
          status: "Released",  // Example status
        };
  
        if (checkResponse.status === 200) {
          // If recipe exists, update it
          console.log("Recipe exists, updating...", payload);
          return axios.put(
            `http://127.0.0.1:5000/api/recipe_materials/${recipeMaterialIdInt}`,  // PUT request to update the material
            payload
          );
        } else {
          // If recipe does not exist, create a new one
          console.log("Recipe does not exist, creating...", payload);
          return axios.post(
            `http://127.0.0.1:5000/api/recipe_materials`,  // POST request to create a new material
            payload
          );
        }
      });
  
      // Filter out any null or undefined promises that were skipped due to missing data
      const validPostPromises = postPromises.filter(promise => promise !== undefined);
  
      // Wait for all post requests to complete
      await Promise.all(validPostPromises);
  
      alert("All recipe materials processed successfully!");
      navigate("/formula-details");
    } catch (error) {
      console.error("Error creating or updating recipe materials:", error);
      alert("Failed to create or update some or all recipe materials.");
    }
  };
  
  
  
  

  return (
    <Box sx={{ p: 3, bgcolor: "background.default" }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Formula Details
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.300" }}>
              <TableCell>Reorder</TableCell>
              <TableCell>Formula</TableCell>
              <TableCell>Storage</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Set Point</TableCell>
              <TableCell>Margin</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipes.map((mat, idx) => {
              const recipeId = mat.recipe_id;
              const actual = parseFloat(actualValues[recipeId]);
              const setPoint = parseFloat(setPoints[recipeId]);
              const margin = parseFloat(margins[recipeId]);
              const isOutOfRange =
                margin &&
                (actual > setPoint + margin || actual < setPoint - margin);

              return (
                <TableRow
                  key={recipeId}
                  sx={{
                    bgcolor: isOutOfRange ? "error.light" : "background.paper",
                  }}
                >
                  <TableCell>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={1}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                      >
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === recipes.length - 1}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
              {/* Formula Column */}
              <TableCell>{mat.name || "No formula available"}</TableCell> {/* Display formula */}
            </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <InputLabel>Storage</InputLabel>
                      <Select
                        value={selectedStorage[recipeId] || ""}
                        onChange={(e) =>
                          setSelectedStorage((prev) => ({
                            ...prev,
                            [recipeId]: e.target.value,
                          }))
                        }
                        label="Storage"
                      >
                        {materials.map((material) => (
                          <MenuItem key={material.material_id} value={material.plant_area_location}>
                            {material.plant_area_location}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>

                  <TableCell>
                    <FormControl fullWidth size="small">
                      <InputLabel>Material</InputLabel>
                      <Select
                        value={selectedMaterials[recipeId] || ""}
                        onChange={(e) => handleMaterialChange(recipeId, e)}
                        label="Material"
                      >
                        {materials.map((material) => (
                          <MenuItem
                            key={material.material_id}
                            value={material.title}
                          >
                            {material.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      sx={{ width: 100 }}
                      value={setPoints[recipeId] ?? ""}
                      onChange={(e) =>
                        handleSetPointChange(recipeId, e.target.value)
                      }
                      placeholder="SetPoint"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      sx={{ width: 80 }}
                      value={margins[recipeId] ?? ""}
                      onChange={(e) =>
                        handleMarginChange(recipeId, e.target.value)
                      }
                      placeholder="±Margin"
                    />
                  </TableCell>
                  <TableCell>
                    {formulaCreatedMap[recipeId] ? "Saved" : "Pending"}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit">
                      <IconButton
                        onClick={() =>
                          navigate(`/formula-details/edit/${mat.recipe_id}`)
                        }
                        sx={{
                          backgroundColor: "#1976d2",
                          color: "#fff",
                          "&:hover": { backgroundColor: "#1565c0" },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                      <IconButton
                        onClick={handleUpdate}
                        sx={{
                            backgroundColor: "green",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#b71c1c" },
                          }}
                      >
                        <UpdateIcon/>
                      </IconButton>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(recipeId)}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#b71c1c" },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FormulaDetails;
