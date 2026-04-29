-- Fix field post_count when category is deleted
-- When a category is deleted, we need to subtract its post_count from the field's post_count

CREATE OR REPLACE FUNCTION update_field_count_on_category_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- When a category is deleted, subtract its post_count from the field's post_count
  IF OLD.field_id IS NOT NULL THEN
    UPDATE public.fields 
    SET post_count = GREATEST(0, post_count - OLD.post_count)
    WHERE id = OLD.field_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for category deletion
DROP TRIGGER IF EXISTS update_field_count_on_category_delete_trigger ON public.categories;
CREATE TRIGGER update_field_count_on_category_delete_trigger
AFTER DELETE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION update_field_count_on_category_delete();

-- Also handle category field_id changes (moving category to different field)
CREATE OR REPLACE FUNCTION update_field_count_on_category_move()
RETURNS TRIGGER AS $$
BEGIN
  -- When category moves to a different field
  IF OLD.field_id IS DISTINCT FROM NEW.field_id THEN
    -- Subtract from old field
    IF OLD.field_id IS NOT NULL THEN
      UPDATE public.fields 
      SET post_count = GREATEST(0, post_count - OLD.post_count)
      WHERE id = OLD.field_id;
    END IF;
    -- Add to new field
    IF NEW.field_id IS NOT NULL THEN
      UPDATE public.fields 
      SET post_count = post_count + NEW.post_count
      WHERE id = NEW.field_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for category field_id update
DROP TRIGGER IF EXISTS update_field_count_on_category_move_trigger ON public.categories;
CREATE TRIGGER update_field_count_on_category_move_trigger
AFTER UPDATE OF field_id ON public.categories
FOR EACH ROW
EXECUTE FUNCTION update_field_count_on_category_move();
