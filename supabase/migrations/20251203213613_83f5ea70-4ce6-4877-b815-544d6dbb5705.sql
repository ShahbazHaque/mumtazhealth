-- Insert Arthritis, Mobility & Joint Care content

-- Chair Yoga practices
INSERT INTO wellness_content (title, description, detailed_guidance, content_type, doshas, cycle_phases, pregnancy_statuses, benefits, tags, difficulty_level, duration_minutes, tier_requirement, preview_content, spiritual_path) VALUES
('Gentle Chair Yoga for Stiff Joints', 'A calming seated practice designed for those with limited mobility or arthritis', 
E'**Welcome to Your Chair Practice**\n\nThis gentle sequence can be done in any sturdy chair. Move slowly and with kindness to yourself.\n\n**Warm-Up (3 minutes)**\n1. Seated breath awareness - hands on belly\n2. Gentle neck rolls - 3 each direction\n3. Shoulder shrugs and rolls\n\n**Main Sequence (15 minutes)**\n1. **Seated Cat-Cow**: Hands on knees, arch and round spine\n2. **Seated Twist**: Right hand to left knee, gentle rotation\n3. **Ankle Circles**: Lift one foot, rotate ankle both ways\n4. **Wrist Stretches**: Circle wrists, open and close fingers\n5. **Seated Forward Fold**: Hinge from hips, drape over thighs\n6. **Seated Side Stretch**: One arm overhead, lean gently\n\n**Cool-Down (2 minutes)**\n1. Return to center\n2. Three deep breaths\n3. Gratitude moment\n\n**Modifications**: Use a pillow behind your back for support. Rest anytime you need.',
'yoga', ARRAY['vata', 'kapha'], ARRAY['post-menopause', 'menopause'], ARRAY['not_pregnant'], 
ARRAY['Improves joint mobility', 'Reduces stiffness', 'Accessible for all abilities', 'Gentle on arthritis', 'No floor work required'], 
ARRAY['chair-yoga', 'arthritis', 'mobility', 'joint-care', 'senior-friendly', 'accessible'], 
'beginner', 20, 'free', 'A gentle seated practice perfect for those with joint concerns or limited mobility.', 'both'),

('Wall-Supported Standing Poses', 'Safe standing yoga using wall support for balance and stability',
E'**Using the Wall for Support**\n\nThe wall is your best friend for safe standing practice. Stand arm''s length away.\n\n**Sequence**\n1. **Wall Mountain Pose**: Back against wall, feet hip-width\n2. **Supported Tree Pose**: One hand on wall, other foot to ankle or calf\n3. **Wall Warrior I**: Side to wall, front knee bent, hand on wall\n4. **Standing Hip Opener**: Face wall, one knee lifted, gentle hip circles\n5. **Supported Forward Fold**: Hands on wall, walk back, hinge at hips\n6. **Wall Push-Ups**: Gentle strengthening for arms and shoulders\n\n**Tips**:\n- Keep soft knees throughout\n- Breathe steadily\n- No rush - honor your body''s pace',
'yoga', ARRAY['vata'], ARRAY['post-menopause', 'menopause', 'perimenopause'], ARRAY['not_pregnant'],
ARRAY['Builds leg strength', 'Improves balance', 'Safe with wall support', 'Reduces fall risk', 'Strengthens bones'],
ARRAY['wall-yoga', 'arthritis', 'mobility', 'balance', 'senior-friendly', 'standing'],
'beginner', 15, 'free', 'Safe standing practice using wall support for stability and confidence.', 'both'),

('Bed-Based Morning Mobility', 'Gentle movements you can do before getting out of bed',
E'**Morning Joint Care in Bed**\n\nBefore you rise, give your joints this loving attention.\n\n**Lying on Your Back**\n1. **Wake-Up Breath**: 5 deep belly breaths\n2. **Ankle Pumps**: Point and flex feet 10 times\n3. **Knee Hugs**: One knee to chest, hold, switch\n4. **Windshield Wipers**: Knees bent, feet flat, rock knees side to side\n5. **Gentle Bridge**: Lift hips if comfortable\n\n**Lying on Your Side**\n1. Gentle hip circles\n2. Ankle rotations\n\n**Sitting on Bed Edge**\n1. Neck stretches\n2. Shoulder rolls\n3. Wrist circles\n\n**Take Your Time**: No rushing. Let your joints warm up before standing.',
'yoga', ARRAY['vata', 'kapha'], ARRAY['post-menopause', 'menopause'], ARRAY['not_pregnant'],
ARRAY['Reduces morning stiffness', 'Safe in bed practice', 'Warms up joints before standing', 'Gentle awakening', 'No equipment needed'],
ARRAY['bed-yoga', 'morning', 'arthritis', 'mobility', 'gentle-start', 'accessible'],
'beginner', 10, 'free', 'Gentle movements to reduce morning stiffness before getting up.', 'both'),

('Functional Movement for Daily Tasks', 'Yoga-inspired movements that help with everyday activities',
E'**Move Better in Daily Life**\n\nThese movements mirror everyday tasks to keep you independent and strong.\n\n**Getting Up from Chairs**\n- Practice sit-to-stand slowly\n- Use arms for support initially\n- Progress to hands-free as able\n\n**Reaching Safely**\n- Overhead reaching with stability\n- Side reaching without strain\n- Lower reaching with knee bend\n\n**Carrying & Lifting**\n- Proper squat mechanics (mini squats)\n- Engaging core before lifting\n- Using legs, not back\n\n**Balance for Walking**\n- Single leg balance (with support)\n- Heel-to-toe walking\n- Side stepping\n\n**Kitchen Tasks**\n- Counter push-ups\n- Standing hip stretches\n- Calf raises while waiting',
'yoga', ARRAY['vata', 'kapha'], ARRAY['post-menopause', 'menopause', 'perimenopause'], ARRAY['not_pregnant'],
ARRAY['Maintains independence', 'Improves daily function', 'Reduces injury risk', 'Practical movements', 'Builds confidence'],
ARRAY['functional-movement', 'arthritis', 'daily-living', 'senior-friendly', 'independence'],
'beginner', 20, 'standard', 'Practical movements to help with everyday tasks.', 'both'),

('Joint Mobility Warm-Up Routine', 'A comprehensive warm-up for all major joints',
E'**Complete Joint Care Sequence**\n\nMove through each joint systematically, like oiling a beautiful machine.\n\n**Head & Neck (2 min)**\n- Gentle nods yes/no\n- Ear to shoulder stretches\n- Neck half-circles (front only)\n\n**Shoulders & Arms (3 min)**\n- Shoulder shrugs and rolls\n- Arm circles (small to large)\n- Elbow bends and extends\n- Wrist circles and finger stretches\n\n**Spine (3 min)**\n- Seated cat-cow\n- Gentle side bends\n- Easy twists\n\n**Hips & Legs (4 min)**\n- Hip circles (standing or seated)\n- Knee lifts\n- Ankle circles\n- Toe scrunches\n\n**Full Body Integration (3 min)**\n- Gentle arm swings\n- Easy marching\n- Deep breaths to close\n\n**Remember**: This is preparation, not exhaustion. Keep it gentle.',
'yoga', ARRAY['vata', 'kapha', 'pitta'], ARRAY['post-menopause', 'menopause', 'perimenopause'], ARRAY['not_pregnant'],
ARRAY['Lubricates all joints', 'Reduces stiffness', 'Prepares body for activity', 'Comprehensive warm-up', 'Safe starting point'],
ARRAY['warm-up', 'joint-mobility', 'arthritis', 'full-body', 'gentle'],
'beginner', 15, 'free', 'A systematic warm-up that cares for every joint in your body.', 'both');

-- Ayurveda Lifestyle for Joint Care
INSERT INTO wellness_content (title, description, detailed_guidance, content_type, doshas, cycle_phases, pregnancy_statuses, benefits, tags, difficulty_level, duration_minutes, tier_requirement, preview_content, spiritual_path) VALUES
('Vata-Balancing Routine for Post-Menopause', 'Grounding daily habits to reduce joint dryness and stiffness',
E'**Understanding Vata in Later Life**\n\nAs we age, Vata (air element) naturally increases, causing dryness in joints, anxiety, and irregular digestion. These practices bring warmth and stability.\n\n**Morning Routine**\n1. Wake gently - no alarm if possible\n2. Warm water with lemon before anything else\n3. Gentle self-massage with warm sesame oil (see below)\n4. Warm shower or bath\n5. Nourishing, warm breakfast\n\n**Daily Oiling Practice (Abhyanga)**\nWarm sesame or almond oil in palms. Massage:\n- Joints in circular motions\n- Long strokes on limbs\n- Clockwise on belly\n- 10-15 minutes before bathing\n\n**Evening Wind-Down**\n1. Early, warm dinner by 7pm\n2. Gentle walk after eating\n3. Warm milk with nutmeg before bed\n4. Early sleep by 10pm\n\n**Weekly**: Warm bath with Epsom salts',
'article', ARRAY['vata'], ARRAY['post-menopause', 'menopause'], ARRAY['not_pregnant'],
ARRAY['Reduces Vata dryness', 'Supports joint lubrication', 'Calms nervous system', 'Improves sleep', 'Grounding effect'],
ARRAY['ayurveda', 'vata-balance', 'post-menopause', 'lifestyle', 'self-care', 'joint-care'],
'beginner', 30, 'standard', 'Ayurvedic lifestyle practices to balance Vata and support joint health.', 'both'),

('Daily Self-Oiling for Joint Comfort', 'Gentle abhyanga practice specifically for stiff and achy joints',
E'**The Gift of Self-Massage**\n\nIn Ayurveda, oiling the body (Abhyanga) is considered one of the most nourishing practices for joint health.\n\n**Choosing Your Oil**\n- Sesame oil: Best for Vata, warming, deeply penetrating\n- Coconut oil: Cooling, good for inflamed joints\n- Castor oil: Very nourishing for severely dry joints\n\n**Warm the Oil**\n- Place bottle in warm water for 5 minutes\n- Test temperature on inner wrist\n- Should be comfortably warm, never hot\n\n**Joint-Focused Technique**\n1. **Knees**: Circular motions around kneecap, massage above and below\n2. **Hips**: Large circles around hip joints\n3. **Shoulders**: Circular motions, include upper back\n4. **Wrists & Ankles**: Small circles, massage between bones\n5. **Fingers & Toes**: Pull gently, massage each joint\n6. **Spine**: Have someone help, or use a long-handled tool\n\n**Timing**: Best done morning before bathing. Even 5 minutes helps.\n\n**Note**: This is lifestyle practice, not medical treatment.',
'article', ARRAY['vata', 'kapha'], ARRAY['post-menopause', 'menopause', 'perimenopause'], ARRAY['not_pregnant'],
ARRAY['Nourishes joint tissue', 'Reduces stiffness', 'Self-care ritual', 'Warming and grounding', 'Ancient wisdom'],
ARRAY['abhyanga', 'self-massage', 'oil', 'joint-care', 'ayurveda', 'arthritis'],
'beginner', 20, 'free', 'Traditional Ayurvedic self-massage practice for joint comfort.', 'both'),

('Habits to Reduce Morning Stiffness', 'Simple lifestyle changes that make mornings easier',
E'**Conquering Morning Stiffness**\n\nMorning stiffness is common but manageable with the right habits.\n\n**Before Sleep**\n1. Warm bath or shower 1 hour before bed\n2. Gentle stretches in bed before sleep\n3. Keep bedroom warm (not cold)\n4. Use supportive pillows for joints\n\n**Waking Up**\n1. Don''t rush out of bed\n2. Do bed-based stretches first (see our bed mobility routine)\n3. Move each joint gently before standing\n4. Take your time - 10 minutes of gentle movement\n\n**First Hour**\n1. Warm drink immediately (warm water, herbal tea)\n2. Warm breakfast (oatmeal, warm soup)\n3. Gentle movement rather than sitting still\n4. Apply warmth to stiff joints if needed\n\n**Throughout Day**\n- Avoid staying in one position too long\n- Set gentle movement reminders\n- Stay warm - layers help\n- Keep hydrated with warm drinks\n\n**What to Avoid**\n- Cold drinks and foods in morning\n- Rushing or sudden movements\n- Skipping breakfast\n- Sitting too long',
'article', ARRAY['vata', 'kapha'], ARRAY['post-menopause', 'menopause'], ARRAY['not_pregnant'],
ARRAY['Reduces morning pain', 'Easy to implement', 'Lifestyle based', 'No special equipment', 'Daily routine'],
ARRAY['morning-stiffness', 'habits', 'lifestyle', 'arthritis', 'joint-care', 'routine'],
'beginner', 15, 'free', 'Simple habits to reduce morning joint stiffness naturally.', 'both');

-- Arthritis-Friendly Nutrition
INSERT INTO wellness_content (title, description, detailed_guidance, content_type, doshas, cycle_phases, pregnancy_statuses, benefits, tags, difficulty_level, duration_minutes, tier_requirement, preview_content, spiritual_path) VALUES
('Anti-Inflammatory Golden Milk', 'Warming turmeric drink for joint comfort',
E'**Golden Milk (Haldi Doodh)**\n\nThis traditional Ayurvedic drink has been used for centuries to support joint health.\n\n**Ingredients**\n- 1 cup milk (dairy or plant-based)\n- 1/2 tsp turmeric powder\n- 1/4 tsp ginger powder (or fresh grated)\n- 1/4 tsp cinnamon\n- Pinch of black pepper (helps absorption)\n- 1/2 tsp honey or maple syrup (optional)\n- 1/4 tsp ghee or coconut oil (optional)\n\n**Method**\n1. Warm milk gently in a small pot\n2. Add spices and stir well\n3. Simmer for 3-5 minutes (don''t boil)\n4. Remove from heat\n5. Add sweetener and fat if using\n6. Stir well and pour into your favorite mug\n\n**When to Drink**\n- Best before bed for joint stiffness\n- Can also enjoy in afternoon\n- Not recommended on empty stomach for sensitive digestion\n\n**Variations**\n- Add cardamom for extra warmth\n- Use oat milk for creamier texture\n- Fresh turmeric root is more potent',
'nutrition', ARRAY['vata', 'kapha'], ARRAY['post-menopause', 'menopause', 'perimenopause'], ARRAY['not_pregnant'],
ARRAY['Anti-inflammatory', 'Supports joint health', 'Warming and soothing', 'Easy to make', 'Traditional recipe'],
ARRAY['golden-milk', 'turmeric', 'anti-inflammatory', 'joint-care', 'recipe', 'ayurveda'],
'beginner', 10, 'free', 'A warming, traditional drink to support joint comfort.', 'both'),

('Warming Kitchari - Gentle on Digestion', 'Simple one-pot meal that supports healing',
E'**Kitchari - The Healing Bowl**\n\nKitchari is the most balancing meal in Ayurveda, perfect for anyone with digestive sensitivity.\n\n**Ingredients**\n- 1/2 cup basmati rice\n- 1/4 cup split mung dal (yellow lentils)\n- 4 cups water\n- 1 tbsp ghee or coconut oil\n- 1/2 tsp turmeric\n- 1/2 tsp cumin seeds\n- 1/2 tsp coriander powder\n- 1/4 tsp ginger powder\n- Salt to taste\n- Optional: soft vegetables (carrots, zucchini)\n\n**Method**\n1. Rinse rice and dal together until water runs clear\n2. Heat ghee in pot, add cumin seeds until they pop\n3. Add remaining spices, stir briefly\n4. Add rice, dal, and water\n5. Bring to boil, then simmer covered 30-40 minutes\n6. Should be soft and porridge-like\n7. Add salt and serve warm\n\n**Tips for Limited Mobility**\n- Use pre-cut vegetables\n- Cook in large batch and reheat\n- Can use rice cooker or slow cooker\n- Freezes well\n\n**Best eaten**: Fresh and warm, lunch or dinner',
'nutrition', ARRAY['vata', 'pitta', 'kapha'], ARRAY['post-menopause', 'menopause', 'perimenopause'], ARRAY['not_pregnant'],
ARRAY['Easy to digest', 'Balancing for all doshas', 'One-pot meal', 'Nourishing', 'Minimal prep'],
ARRAY['kitchari', 'recipe', 'easy-cooking', 'joint-care', 'ayurveda', 'one-pot'],
'beginner', 45, 'free', 'A simple, nourishing one-pot meal that''s gentle on the body.', 'both'),

('Bone-Supporting Soup', 'Mineral-rich soup for bone and joint health',
E'**Nourishing Bone Soup**\n\nRich in minerals that support bone density and joint health.\n\n**Ingredients**\n- 6 cups vegetable or bone broth\n- 2 cups dark leafy greens (kale, spinach), chopped\n- 1 can white beans, drained\n- 2 carrots, diced\n- 2 celery stalks, diced\n- 1 onion, diced\n- 3 garlic cloves, minced\n- 1 tbsp olive oil\n- 1 tsp turmeric\n- 1/2 tsp black pepper\n- Fresh herbs (thyme, rosemary)\n- Salt to taste\n\n**Method**\n1. Sauté onion, carrots, celery in olive oil until soft (10 min)\n2. Add garlic, cook 1 minute\n3. Add broth, spices, and beans\n4. Simmer 20 minutes\n5. Add greens in last 5 minutes\n6. Season and serve warm\n\n**Minimal Prep Options**\n- Use pre-cut frozen vegetables\n- Use canned beans (no soaking)\n- Make in slow cooker\n- Batch cook and freeze portions\n\n**Serve with**: Warm crusty bread or rice',
'nutrition', ARRAY['vata', 'kapha'], ARRAY['post-menopause', 'menopause'], ARRAY['not_pregnant'],
ARRAY['Mineral-rich', 'Supports bone health', 'Easy to chew', 'Warming', 'Freezer-friendly'],
ARRAY['soup', 'bone-health', 'recipe', 'easy-cooking', 'joint-care', 'minerals'],
'beginner', 40, 'standard', 'A mineral-rich soup to support bones and joints.', 'both'),

('Easy Anti-Inflammatory Breakfast Ideas', 'Simple morning meals that reduce inflammation',
E'**Gentle Breakfasts for Joint Health**\n\nStart your day with foods that calm inflammation.\n\n**1. Warm Oatmeal Bowl**\n- Rolled oats cooked with cinnamon\n- Top with walnuts and berries\n- Drizzle of honey\n- Prep time: 10 minutes\n\n**2. Soft Scrambled Eggs**\n- Cooked low and slow with turmeric\n- Served with avocado\n- On soft toast\n- Prep time: 8 minutes\n\n**3. Warm Fruit Compote**\n- Stewed apples and pears with cinnamon\n- Topped with yogurt and ground flax\n- Prep time: 15 minutes\n\n**4. Smoothie (Room Temperature)**\n- Banana, ginger, turmeric, almond milk\n- Let sit to reach room temperature\n- Add spinach for extra nutrients\n- Prep time: 5 minutes\n\n**5. Upma (Savory Semolina)**\n- Traditional Indian breakfast\n- Warming and grounding\n- Easy to digest\n- Prep time: 15 minutes\n\n**Tips**: Avoid ice-cold foods in the morning. Warmth helps stiff joints.',
'nutrition', ARRAY['vata', 'kapha', 'pitta'], ARRAY['post-menopause', 'menopause', 'perimenopause'], ARRAY['not_pregnant'],
ARRAY['Anti-inflammatory', 'Easy to prepare', 'Multiple options', 'Warming', 'Nutritious'],
ARRAY['breakfast', 'anti-inflammatory', 'easy-cooking', 'joint-care', 'recipes', 'morning'],
'beginner', 15, 'free', 'Simple breakfast ideas that support joint health.', 'both');

-- Spiritual & Emotional Support
INSERT INTO wellness_content (title, description, detailed_guidance, content_type, doshas, cycle_phases, pregnancy_statuses, benefits, tags, difficulty_level, duration_minutes, tier_requirement, preview_content, spiritual_path) VALUES
('Gentle Breath for Pain Relief', 'Calming breathwork for chronic pain and discomfort',
E'**Breathing Through Discomfort**\n\nBreath is a powerful tool for managing pain. These gentle techniques help calm the nervous system.\n\n**1. Belly Breathing (5 minutes)**\n- Sit or lie comfortably\n- Place hands on belly\n- Breathe in through nose, feel belly rise\n- Exhale slowly through mouth, belly falls\n- Focus only on the breath\n- No forcing or straining\n\n**2. 4-7-8 Relaxation Breath**\n- Inhale through nose for 4 counts\n- Hold gently for 7 counts\n- Exhale through mouth for 8 counts\n- Repeat 4 times\n- Deeply calming for pain flares\n\n**3. Cooling Breath (Sitali)**\n- Curl tongue into tube (or purse lips)\n- Inhale through curled tongue\n- Close mouth, exhale through nose\n- Cooling and calming\n- Good for inflammation\n\n**When Pain is Intense**\n- Keep breaths gentle, never force\n- Focus on exhale being longer than inhale\n- Imagine breathing into the area of pain\n- Visualize tension releasing on each exhale\n\n**Practice daily, not just during pain.**',
'meditation', ARRAY['vata', 'pitta'], ARRAY['post-menopause', 'menopause', 'perimenopause'], ARRAY['not_pregnant'],
ARRAY['Pain management', 'Calms nervous system', 'No physical effort required', 'Accessible anywhere', 'Reduces tension'],
ARRAY['breathwork', 'pain-relief', 'calming', 'arthritis', 'accessible', 'meditation'],
'beginner', 15, 'free', 'Gentle breathing techniques to help manage chronic pain.', 'both'),

('Gratitude Practice for Aging Gracefully', 'A gentle gratitude ritual for embracing this life stage',
E'**Embracing This Season of Life**\n\nGratitude shifts our focus from what the body can no longer do to what it has carried us through.\n\n**Morning Gratitude (5 minutes)**\nBefore getting up, think of:\n1. Three things your body did for you yesterday\n2. One person you''re grateful for\n3. Something simple you''re looking forward to today\n\n**Body Gratitude Practice**\nPlace hands on different body parts and thank them:\n- "Thank you, feet, for carrying me"\n- "Thank you, hands, for all you''ve created"\n- "Thank you, heart, for beating without being asked"\n- Include joints that ache - thank them for their years of service\n\n**Evening Reflection (5 minutes)**\n- What moment brought you joy today?\n- What did you accomplish, no matter how small?\n- What are you releasing from today?\n\n**Gratitude Journal**\n- Keep a simple notebook by your bed\n- Write 3 things each night\n- Review weekly to see the beauty in your days\n\n**Remember**: Every wrinkle, every grey hair, every stiff joint tells the story of a life fully lived.',
'meditation', ARRAY['vata', 'pitta', 'kapha'], ARRAY['post-menopause', 'menopause'], ARRAY['not_pregnant'],
ARRAY['Emotional wellbeing', 'Positive mindset', 'Simple practice', 'Aging gracefully', 'Self-compassion'],
ARRAY['gratitude', 'emotional', 'aging', 'mindset', 'self-love', 'meditation'],
'beginner', 10, 'free', 'A gentle gratitude practice for embracing this beautiful life stage.', 'both'),

('Grounding Meditation for Chronic Pain', 'Earth-based visualization for stability and calm',
E'**Finding Ground When Pain Overwhelms**\n\nWhen chronic pain makes you feel unmoored, this practice brings you back to earth.\n\n**Preparation**\n- Find a comfortable position (sitting or lying)\n- Close eyes or soften gaze\n- Take three deep breaths\n\n**The Grounding Practice (15 minutes)**\n\n*Part 1: Earth Connection*\nImagine roots growing from the base of your spine, down through the floor, deep into the earth. Feel the stability of the ground beneath you. You are held. You are supported.\n\n*Part 2: Mountain Visualization*\nVisualize yourself as a mountain. Solid. Unchanging. Weather passes around you - pain is like weather. It comes and goes. You remain.\n\n*Part 3: Body Scan with Compassion*\nSlowly move attention through your body. Where there is pain, imagine sending warm, golden light. Don''t try to fix it. Just acknowledge it with kindness.\n\n*Part 4: Return*\nWiggle fingers and toes. Take a deep breath. When ready, open your eyes.\n\n**Practice especially during pain flares.**',
'meditation', ARRAY['vata'], ARRAY['post-menopause', 'menopause', 'perimenopause'], ARRAY['not_pregnant'],
ARRAY['Emotional grounding', 'Pain coping', 'Reduces anxiety', 'Calming visualization', 'Self-compassion'],
ARRAY['grounding', 'chronic-pain', 'meditation', 'visualization', 'calm', 'earth'],
'beginner', 20, 'standard', 'A grounding meditation for finding stability during chronic pain.', 'both'),

('Loving-Kindness for Your Aging Body', 'Metta meditation adapted for body acceptance',
E'**Compassion for Your Beautiful Body**\n\nThis ancient practice helps us befriend our bodies exactly as they are.\n\n**Setting Up**\n- Comfortable seated or lying position\n- Hands on heart or belly\n- Soft, natural breathing\n\n**The Practice (15 minutes)**\n\n*Towards Yourself*\nRepeat silently:\n- "May I be free from suffering"\n- "May I accept my body as it is"\n- "May I find peace with aging"\n- "May I be filled with loving-kindness"\n\n*Towards Your Body*\n- "May my joints find ease"\n- "May my body be comfortable"\n- "May I honor all my body has done"\n- "May I treat myself with gentleness"\n\n*Towards All Who Share This Experience*\n- "May all who live with pain find relief"\n- "May all aging bodies be honored"\n- "May we all find peace with change"\n- "May we all be well"\n\n**Closing**\nPlace both hands on heart. Take three breaths. Know that you are worthy of love and kindness, exactly as you are.\n\n**Practice when self-criticism arises.**',
'meditation', ARRAY['vata', 'pitta', 'kapha'], ARRAY['post-menopause', 'menopause'], ARRAY['not_pregnant'],
ARRAY['Self-compassion', 'Body acceptance', 'Emotional healing', 'Ancient practice', 'Heart-opening'],
ARRAY['loving-kindness', 'metta', 'body-acceptance', 'self-love', 'meditation', 'aging'],
'beginner', 15, 'free', 'A loving-kindness meditation for accepting and honoring your body.', 'both'),

('Restorative Evening Wind-Down', 'Gentle audio-guided relaxation for better sleep',
E'**Releasing the Day**\n\nThis gentle practice prepares body and mind for restful sleep.\n\n**Part 1: Physical Release (5 minutes)**\nLying in bed, systematically tense and release:\n- Feet and ankles - squeeze, release\n- Legs - squeeze, release\n- Hips and belly - squeeze, release\n- Hands and arms - squeeze, release\n- Shoulders and face - squeeze, release\n- Feel the difference between tension and relaxation\n\n**Part 2: Breath Relaxation (5 minutes)**\n- Natural, easy breathing\n- Count backwards from 10 to 1 on exhales\n- If you lose count, start again at 10\n- Allow breath to become slower and softer\n\n**Part 3: Body Gratitude (5 minutes)**\n- Thank your body for carrying you today\n- Acknowledge any pain without judgment\n- Imagine your body healing as you sleep\n- Trust in your body''s wisdom\n\n**Part 4: Peaceful Imagery (5 minutes)**\n- Imagine a place of complete safety\n- Feel the peace of that place\n- Let it hold you as you drift toward sleep\n\n**Do this practice in bed, allowing sleep to come naturally.**',
'meditation', ARRAY['vata'], ARRAY['post-menopause', 'menopause', 'perimenopause'], ARRAY['not_pregnant'],
ARRAY['Improves sleep', 'Releases tension', 'Evening routine', 'Gentle practice', 'Calming'],
ARRAY['sleep', 'evening', 'relaxation', 'wind-down', 'restorative', 'accessible'],
'beginner', 20, 'standard', 'A gentle evening practice to release tension and prepare for sleep.', 'both');