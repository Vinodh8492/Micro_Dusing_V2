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

  const handleDelete = async (e) => {
    e.preventDefault();
    console.log("🧨 handleDelete triggered");
  
    try {
      const existingResponse = await axios.get("http://127.0.0.1:5000/api/recipe_materials");
      const existingMaterials = existingResponse.data;
      console.log("📦 Existing materials:", existingMaterials);
  
      const deletePromises = Object.keys(selectedMaterials).map(async (recipeId) => {
        console.log(`🔁 Processing recipeId: ${recipeId}`);
  
        const materialName = selectedMaterials[recipeId];
        console.log(`🎯 Material Name: ${materialName}`);
  
        const selectedMaterial = materials.find((m) => m.title === materialName);
        if (!selectedMaterial) {
          console.warn(`⚠️ Material not found for Recipe ID: ${recipeId}`);
          return;
        }
  
        const recipeIdInt = parseInt(recipeId, 10);
        const materialIdInt = parseInt(selectedMaterial.material_id, 10);
  
        console.log(`Comparing: ${recipeIdInt} and ${materialIdInt}`);
  
        if (isNaN(recipeIdInt) || isNaN(materialIdInt)) {
          console.warn(`⚠️ Invalid ID values for Recipe ID: ${recipeId}`);
          return;
        }
  
        const existingMatch = existingMaterials.find(
          (item) =>
            parseInt(item.recipe_id, 10) === recipeIdInt &&
            parseInt(item.material_id, 10) === materialIdInt
        );
  
        console.log("🔍 Match found:", existingMatch);
  
        if (!existingMatch) {
          alert(`No matching recipe material found to delete for Recipe ID: ${recipeId}`);
          return;
        }
  
        console.log(`🗑 Deleting recipe_material_id: ${existingMatch.recipe_material_id}`);
        await axios.delete(`http://127.0.0.1:5000/api/recipe_materials/${existingMatch.recipe_material_id}`);
      });
  
      const validDeletePromises = deletePromises.filter(Boolean);
      await Promise.all(validDeletePromises);
  
      alert("Selected recipe materials deleted successfully!");
      setSetPoints({});
      setSelectedMaterials({});
    } catch (error) {
      console.error("🔥 Error deleting recipe materials:", error);
      alert("Failed to delete some or all recipe materials.");
    }
  };
  
  

  const handleUpdate = async (e) => {
    e.preventDefault();
  
    try {
      // Get all existing recipe_materials to match against
      const existingResponse = await axios.get("http://127.0.0.1:5000/api/recipe_materials");
      const existingMaterials = existingResponse.data;  // Assuming it's an array of recipe materials
  
      const postPromises = Object.keys(selectedMaterials).map(async (recipeId) => {
        const materialName = selectedMaterials[recipeId];
        const setPoint = setPoints[recipeId];
  
        if (!materialName || !setPoint) {
          alert(`Missing values for material with Recipe ID: ${recipeId}`);
          return;
        }
  
        const selectedMaterial = materials.find((m) => m.title === materialName);
        if (!selectedMaterial) {
          alert(`Material not found for Recipe ID: ${recipeId}`);
          return;
        }
  
        const recipeIdInt = parseInt(recipeId, 10);
        const materialIdInt = parseInt(selectedMaterial.material_id, 10);
  
        if (isNaN(recipeIdInt) || isNaN(materialIdInt)) {
          alert(`Invalid ID values`);
          return;
        }
  
        // Check if combination already exists
        const existingMatch = existingMaterials.find(
          (item) => item.recipe_id === recipeIdInt && item.material_id === materialIdInt
        );
  
        const payload = {
          recipe_id: recipeIdInt,
          material_id: materialIdInt,
          set_point: parseFloat(setPoint),
          actual: 0,
          status: "Released",
        };
  
        console.log(existingMatch ? "Updating..." : "Creating...", payload);
  
        // Regardless, POST to the same endpoint — the backend handles update if found
        return axios.post("http://127.0.0.1:5000/api/recipe_materials", payload);
      });
  
      const validPostPromises = postPromises.filter(Boolean);
      await Promise.all(validPostPromises);
  
      alert("All recipe materials processed successfully!");
      setSetPoints({});
setSelectedMaterials({});
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
                          onClick={handleDelete}
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
